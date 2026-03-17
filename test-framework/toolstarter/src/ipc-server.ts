/**
 * IPC сервер для коммуникации с Test Runner
 * TCP сервер с JSON протоколом
 */

import * as net from 'net';
import * as path from 'path';
import * as vscode from 'vscode';
import type {
  IPCMessage,
  ToolExecutionRequest,
  ToolExecutionResponse,
  IPCServerState,
} from './types';
import { getGlobalRegistry } from './tool-registry';
import { validateResult } from './validator';

/**
 * IPC сервер для приема команд от runner
 */
export class IPCServer {
  private server: net.Server | null = null;
  private state: IPCServerState = {
    running: false,
    connections: 0,
  };
  private port: number;
  private outputChannel: vscode.OutputChannel;

  constructor(port: number, outputChannel: vscode.OutputChannel) {
    this.port = port;
    this.outputChannel = outputChannel;
  }

  /**
   * Запускает TCP сервер
   */
  async start(): Promise<void> {
    if (this.state.running) {
      this.log('Server already running');
      return;
    }

    return new Promise((resolve, reject) => {
      this.server = net.createServer((socket) => {
        this.handleConnection(socket);
      });

      this.server.on('error', (err) => {
        this.log(`Server error: ${err.message}`);
        this.state.running = false;
        reject(err);
      });

      this.server.listen(this.port, '127.0.0.1', () => {
        this.state.running = true;
        this.state.port = this.port;
        this.log(`IPC server started on port ${this.port}`);
        resolve();
      });
    });
  }

  /**
   * Останавливает TCP сервер
   */
  async stop(): Promise<void> {
    if (!this.server || !this.state.running) {
      return;
    }

    return new Promise((resolve) => {
      this.server!.close(() => {
        this.state.running = false;
        this.state.connections = 0;
        this.log('IPC server stopped');
        resolve();
      });
    });
  }

  /**
   * Возвращает состояние сервера
   */
  getState(): IPCServerState {
    return { ...this.state };
  }

  /**
   * Обрабатывает входящее соединение
   */
  private handleConnection(socket: net.Socket): void {
    this.state.connections++;
    const clientAddr = `${socket.remoteAddress}:${socket.remotePort}`;
    this.log(`Client connected: ${clientAddr} (total: ${this.state.connections})`);

    let buffer = '';

    socket.on('data', (data) => {
      buffer += data.toString();
      
      // Обрабатываем сообщения, разделенные новой строкой
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? ''; // Оставляем неполную строку в буфере

      for (const line of lines) {
        if (line.trim()) {
          this.handleMessage(line, socket);
        }
      }
    });

    socket.on('close', () => {
      this.state.connections--;
      this.log(`Client disconnected: ${clientAddr} (total: ${this.state.connections})`);
    });

    socket.on('error', (err) => {
      this.log(`Socket error: ${err.message}`);
    });
  }

  /**
   * Обрабатывает входящее сообщение
   */
  private async handleMessage(rawMessage: string, socket: net.Socket): Promise<void> {
    let message: IPCMessage & { id?: string };

    try {
      message = JSON.parse(rawMessage);
    } catch {
      this.sendError(socket, 'Invalid JSON message');
      return;
    }

    this.log(`Received message: ${message.type} (id: ${message.id || 'none'})`);

    switch (message.type) {
      case 'runTest':
        await this.handleRunTest(message.payload as ToolExecutionRequest, socket, message.id);
        break;

      case 'shutdown':
        this.handleShutdown(socket, message.id);
        break;

      case 'ping':
        this.sendMessage(socket, { type: 'pong', id: message.id, payload: {} });
        break;

      default:
        this.sendError(socket, `Unknown message type: ${message.type}`, message.id);
    }
  }

  /**
   * Обрабатывает запрос на выполнение теста
   */
  private async handleRunTest(
    request: ToolExecutionRequest,
    socket: net.Socket,
    requestId?: string
  ): Promise<void> {
    const startTime = Date.now();
    const registry = getGlobalRegistry();

    try {
      // Получаем workspaceRoot из текущего workspace
      const workspaceFolders = vscode.workspace.workspaceFolders;
      const workspaceRoot = workspaceFolders && workspaceFolders.length > 0
        ? workspaceFolders[0].uri.fsPath
        : '';
      
      // Ждем готовности LSP сервера перед выполнением
      if (workspaceRoot) {
        await this.waitForLSPReady(workspaceRoot);
      }
      
      // Загружаем tool
      const loadResult = await registry.loadAndRegister(request.toolPath);
      
      if (!loadResult.success) {
        this.sendTestResult(socket, {
          success: false,
          error: `Failed to load tool: ${loadResult.error}`,
          duration: Date.now() - startTime,
        }, requestId);
        return;
      }

      // Выполняем tool
      const executeResult = await registry.executeTool(
        request.toolName,
        request.params ?? {}
      );

      if (!executeResult.success) {
        this.sendTestResult(socket, {
          success: false,
          error: executeResult.error,
          duration: executeResult.duration,
        }, requestId);
        return;
      }

      // Валидируем результат
      const validationResult = validateResult(executeResult.result, request.expected);

      this.sendTestResult(socket, {
        success: validationResult.valid,
        output: executeResult.result,
        error: validationResult.error,
        duration: executeResult.duration,
      }, requestId);
    } catch (error) {
      this.sendTestResult(socket, {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      }, requestId);
    }
  }

  /**
   * Обрабатывает запрос на завершение работы
   */
  private handleShutdown(socket: net.Socket, requestId?: string): void {
    this.log('Shutdown requested');
    this.sendMessage(socket, { type: 'shutdownAck', id: requestId, payload: {} });
    
    // Даем время на отправку ответа перед остановкой
    setTimeout(() => {
      this.stop().then(() => {
        vscode.commands.executeCommand('workbench.action.closeWindow');
      });
    }, 100);
  }

  /**
   * Отправляет сообщение клиенту
   */
  private sendMessage(socket: net.Socket, message: IPCMessage & { id?: string }): void {
    try {
      const json = JSON.stringify(message);
      socket.write(json + '\n');
      this.log(`Sent: ${message.type} (id: ${message.id || 'none'})`);
    } catch (error) {
      this.log(`Failed to send message: ${error}`);
    }
  }

  /**
   * Отправляет результат теста
   */
  private sendTestResult(socket: net.Socket, result: ToolExecutionResponse, requestId?: string): void {
    this.sendMessage(socket, { type: 'testResult', id: requestId, payload: result });
  }

  /**
   * Отправляет ошибку
   */
  private sendError(socket: net.Socket, message: string, requestId?: string): void {
    this.sendMessage(socket, {
      type: 'error',
      id: requestId,
      payload: { message },
    });
  }

  /**
   * Ожидает готовности LSP сервера
   * Проверяет готовность путем запроса определений из тестового файла
   */
  private async waitForLSPReady(workspaceRoot: string, timeout: number = 30000): Promise<void> {
    const testFile = path.join(workspaceRoot, 'hello.ts');
    const startTime = Date.now();
    
    this.log(`Waiting for LSP to be ready (workspace: ${workspaceRoot})`);
    
    while (Date.now() - startTime < timeout) {
      try {
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(testFile));
        const result = await vscode.commands.executeCommand(
          'vscode.executeDefinitionProvider',
          doc.uri,
          new vscode.Position(0, 0)
        );
        if (result !== undefined && result !== null) {
          this.log('LSP is ready');
          await this.warmupWorkspace(workspaceRoot);
          return;
        }
      } catch (e) {
        // Ignore errors during readiness check
      }
      await new Promise(r => setTimeout(r, 500));
    }
    this.log('LSP readiness check timeout, proceeding anyway');
  }

  /**
   * Прогревает LSP путем открытия всех TypeScript файлов в workspace
   * Это необходимо для того, чтобы LSP знал точные позиции определений
   */
  private async warmupWorkspace(workspaceRoot: string): Promise<void> {
    try {
      const files = await vscode.workspace.findFiles('**/*.ts', '**/node_modules/**');
      this.log(`Warming up ${files.length} TypeScript files...`);
      
      for (const file of files) {
        await vscode.workspace.openTextDocument(file);
      }
      
      this.log('Workspace warmup complete');
    } catch (error) {
      this.log(`Error during workspace warmup: ${error}`);
    }
  }

  /**
   * Логирует сообщение в output channel
   */
  private log(message: string): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] ${message}`);
    console.log(`[IPCServer] ${message}`);
  }
}

/**
 * Глобальный экземпляр IPC сервера
 */
let globalServer: IPCServer | null = null;

/**
 * Получает или создает глобальный IPC сервер
 */
export function getGlobalIPCServer(
  port?: number,
  outputChannel?: vscode.OutputChannel
): IPCServer {
  if (!globalServer) {
    const config = vscode.workspace.getConfiguration('toolstarter');
    const defaultPort = config.get<number>('port', 9876);
    
    const channel = outputChannel ?? vscode.window.createOutputChannel('ToolStarter');
    globalServer = new IPCServer(port ?? defaultPort, channel);
  }
  return globalServer;
}

/**
 * Сбрасывает глобальный сервер
 */
export function resetGlobalIPCServer(): void {
  if (globalServer) {
    globalServer.stop();
  }
  globalServer = null;
}
