/**
 * ToolStarter Extension - VSCode extension entry point
 * Эмулирует хост RooCode для тестирования custom tools
 */

import * as vscode from 'vscode';
import { getGlobalIPCServer, resetGlobalIPCServer } from './ipc-server';
import { getGlobalRegistry, resetGlobalRegistry } from './tool-registry';

let outputChannel: vscode.OutputChannel;

/**
 * Активация extension
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  outputChannel = vscode.window.createOutputChannel('ToolStarter');
  outputChannel.appendLine('ToolStarter extension activating...');
  outputChannel.show(true);

  const config = vscode.workspace.getConfiguration('toolstarter');
  const autoStart = config.get<boolean>('autoStart', true);
  const port = config.get<number>('port', 9876);

  // Регистрируем команды
  registerCommands(context);

  // Автозапуск IPC сервера
  if (autoStart) {
    try {
      const server = getGlobalIPCServer(port, outputChannel);
      await server.start();
      
      // Отправляем уведомление о готовности
      outputChannel.appendLine(`ToolStarter ready on port ${port}`);
      vscode.window.showInformationMessage(
        `ToolStarter: IPC server started on port ${port}`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      outputChannel.appendLine(`Failed to start IPC server: ${message}`);
      vscode.window.showErrorMessage(
        `ToolStarter: Failed to start IPC server - ${message}`
      );
    }
  }

  outputChannel.appendLine('ToolStarter extension activated');
}

/**
 * Деактивация extension
 */
export async function deactivate(): Promise<void> {
  outputChannel.appendLine('ToolStarter extension deactivating...');

  // Останавливаем IPC сервер
  resetGlobalIPCServer();
  
  // Очищаем реестр
  resetGlobalRegistry();

  outputChannel.appendLine('ToolStarter extension deactivated');
}

/**
 * Регистрирует команды extension
 */
function registerCommands(context: vscode.ExtensionContext): void {
  // Команда: Run Test
  const runTestCommand = vscode.commands.registerCommand(
    'toolstarter.runTest',
    async () => {
      const input = await vscode.window.showInputBox({
        prompt: 'Enter tool path (relative to workspace)',
        placeHolder: 'e.g., src/test.ts',
      });

      if (!input) {
        return;
      }

      const toolName = await vscode.window.showInputBox({
        prompt: 'Enter tool name',
        placeHolder: 'e.g., tommorow',
      });

      if (!toolName) {
        return;
      }

      const paramsInput = await vscode.window.showInputBox({
        prompt: 'Enter params as JSON (optional)',
        placeHolder: '{}',
      });

      let params = {};
      if (paramsInput) {
        try {
          params = JSON.parse(paramsInput);
        } catch {
          vscode.window.showErrorMessage('Invalid JSON params');
          return;
        }
      }

      const registry = getGlobalRegistry();
      
      // Загружаем tool
      const loadResult = await registry.loadAndRegister(input);
      if (!loadResult.success) {
        vscode.window.showErrorMessage(`Failed to load tool: ${loadResult.error}`);
        return;
      }

      // Выполняем
      const result = await registry.executeTool(toolName, params);
      
      if (result.success) {
        vscode.window.showInformationMessage(
          `Tool executed successfully in ${result.duration}ms`
        );
        outputChannel.appendLine(`Result: ${JSON.stringify(result.result, null, 2)}`);
      } else {
        vscode.window.showErrorMessage(`Tool failed: ${result.error}`);
      }
    }
  );

  // Команда: Show Status
  const showStatusCommand = vscode.commands.registerCommand(
    'toolstarter.showStatus',
    () => {
      const registry = getGlobalRegistry();
      const state = registry.getState();
      
      const server = getGlobalIPCServer();
      const serverState = server.getState();

      const message = [
        `ToolStarter Status:`,
        `  IPC Server: ${serverState.running ? `Running on port ${serverState.port}` : 'Stopped'}`,
        `  Active connections: ${serverState.connections}`,
        `  Registered tools: ${state.toolCount}`,
        ...state.tools.map(t => `    - ${t.name} (${t.path})`),
      ].join('\n');

      outputChannel.appendLine(message);
      outputChannel.show();

      vscode.window.showInformationMessage(
        `ToolStarter: ${state.toolCount} tools, Server ${serverState.running ? 'running' : 'stopped'}`
      );
    }
  );

  // Команда: Reload Tools
  const reloadToolsCommand = vscode.commands.registerCommand(
    'toolstarter.reloadTools',
    async () => {
      const registry = getGlobalRegistry();
      registry.clear();
      
      vscode.window.showInformationMessage('ToolStarter: Tools registry cleared');
      outputChannel.appendLine('Tools registry cleared');
    }
  );

  // Команда: Start Server
  const startServerCommand = vscode.commands.registerCommand(
    'toolstarter.startServer',
    async () => {
      const config = vscode.workspace.getConfiguration('toolstarter');
      const port = config.get<number>('port', 9876);

      try {
        const server = getGlobalIPCServer(port, outputChannel);
        await server.start();
        vscode.window.showInformationMessage(`ToolStarter: Server started on port ${port}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`ToolStarter: ${message}`);
      }
    }
  );

  // Команда: Stop Server
  const stopServerCommand = vscode.commands.registerCommand(
    'toolstarter.stopServer',
    async () => {
      const server = getGlobalIPCServer();
      await server.stop();
      vscode.window.showInformationMessage('ToolStarter: Server stopped');
    }
  );

  context.subscriptions.push(
    runTestCommand,
    showStatusCommand,
    reloadToolsCommand,
    startServerCommand,
    stopServerCommand
  );
}

/**
 * Экспортируем типы для внешнего использования
 */
export { 
  ToolRegistry, 
  getGlobalRegistry 
} from './tool-registry';

export { 
  IPCServer, 
  getGlobalIPCServer 
} from './ipc-server';

export { 
  validateResult 
} from './validator';

export { 
  loadToolFromFile 
} from './tool-loader';

export * from './types';
