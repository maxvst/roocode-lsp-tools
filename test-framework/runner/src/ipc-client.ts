/**
 * IPC Client - коммуникация с ToolStarter extension через TCP socket
 */

import { createConnection, Socket } from 'net';
import { randomUUID } from 'crypto';
import {
  IPCMessage,
  ToolExecutionResponse,
  ExtensionEvent,
  IPCClientState,
  TestCase,
  TestResult,
} from './types';

/**
 * IPC клиент для коммуникации с ToolStarter extension
 */
export class IPCClient {
  private socket: Socket | null = null;
  private state: IPCClientState;
  private port: number;
  private host: string;
  private buffer: string = '';
  private eventHandlers: Map<string, ((event: ExtensionEvent) => void)[]> = new Map();

  constructor(port: number = 9234, host: string = 'localhost') {
    this.port = port;
    this.host = host;
    this.state = {
      connected: false,
      pendingRequests: new Map(),
    };
  }

  /**
   * Проверить, подключен ли клиент
   */
  isConnected(): boolean {
    return this.state.connected;
  }

  /**
   * Подключиться к IPC серверу
   */
  async connect(maxRetries: number = 10, retryDelay: number = 1000): Promise<void> {
    if (this.state.connected) {
      return;
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.attemptConnection();
        console.log(`[IPCClient] Connected to ${this.host}:${this.port}`);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(
          `[IPCClient] Connection attempt ${attempt}/${maxRetries} failed: ${lastError.message}`
        );
        
        if (attempt < maxRetries) {
          await this.delay(retryDelay);
        }
      }
    }

    throw new Error(
      `Failed to connect to IPC server after ${maxRetries} attempts: ${lastError?.message}`
    );
  }

  /**
   * Попытка подключения
   */
  private attemptConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.socket) {
          this.socket.destroy();
          this.socket = null;
        }
        reject(new Error('Connection timeout'));
      }, 5000);

      this.socket = createConnection({ port: this.port, host: this.host }, () => {
        clearTimeout(timeout);
        this.state.connected = true;
        this.setupSocketHandlers();
        resolve();
      });

      this.socket.on('error', (error) => {
        clearTimeout(timeout);
        this.state.connected = false;
        reject(error);
      });
    });
  }

  /**
   * Настроить обработчики socket
   */
  private setupSocketHandlers(): void {
    if (!this.socket) return;

    this.socket.on('data', (data) => {
      this.handleData(data.toString());
    });

    this.socket.on('close', () => {
      console.log('[IPCClient] Connection closed');
      this.state.connected = false;
      this.rejectAllPending('Connection closed');
    });

    this.socket.on('error', (error) => {
      console.error('[IPCClient] Socket error:', error.message);
      this.state.connected = false;
      this.rejectAllPending(error.message);
    });
  }

  /**
   * Обработать входящие данные
   */
  private handleData(data: string): void {
    this.buffer += data;

    // Разбираем сообщения по разделителю (newline)
    const messages = this.buffer.split('\n');
    this.buffer = messages.pop() || ''; // Последний элемент может быть неполным

    for (const messageStr of messages) {
      if (messageStr.trim()) {
        try {
          const message: IPCMessage = JSON.parse(messageStr);
          this.handleMessage(message);
        } catch (error) {
          console.error('[IPCClient] Failed to parse message:', messageStr, error);
        }
      }
    }
  }

  /**
   * Обработать входящее сообщение
   */
  private handleMessage(message: IPCMessage): void {
    const messageId = message.id;
    
    // Обрабатываем ответ testResult от IPCServer
    if (message.type === 'testResult') {
      if (!messageId) {
        console.warn('[IPCClient] Received testResult without id');
        return;
      }
      const pending = this.state.pendingRequests.get(messageId);
      if (pending) {
        clearTimeout(pending.timeout);
        this.state.pendingRequests.delete(messageId);
        pending.resolve(message.payload as ToolExecutionResponse);
      } else {
        console.warn('[IPCClient] Received testResult for unknown request:', messageId);
      }
    } else if (message.type === 'response' || message.type === 'error') {
      // Это ответ на запрос (старый формат) или ошибка
      if (!messageId) {
        console.warn('[IPCClient] Received response without id');
        return;
      }
      const pending = this.state.pendingRequests.get(messageId);
      if (pending) {
        clearTimeout(pending.timeout);
        this.state.pendingRequests.delete(messageId);
        if (message.type === 'error') {
          pending.reject(new Error((message.payload as { message: string }).message));
        } else {
          pending.resolve(message.payload as ToolExecutionResponse);
        }
      } else {
        console.warn('[IPCClient] Received response for unknown request:', messageId);
      }
    } else if (message.type === 'event') {
      // Это событие от extension
      this.handleEvent(message.payload as ExtensionEvent);
    }
  }

  /**
   * Обработать событие от extension
   */
  private handleEvent(event: ExtensionEvent): void {
    console.log('[IPCClient] Received event:', event.type);
    const handlers = this.eventHandlers.get(event.type) || [];
    handlers.forEach((handler) => handler(event));
    
    // Также вызываем обработчики для '*'
    const wildcardHandlers = this.eventHandlers.get('*') || [];
    wildcardHandlers.forEach((handler) => handler(event));
  }

  /**
   * Подписаться на события
   */
  on(eventType: string, handler: (event: ExtensionEvent) => void): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);
  }

  /**
   * Отписаться от событий
   */
  off(eventType: string, handler: (event: ExtensionEvent) => void): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
      this.eventHandlers.set(eventType, handlers);
    }
  }

  /**
   * Отправить запрос на выполнение tool
   */
  async runTest(testCase: TestCase): Promise<TestResult> {
    const startTime = Date.now();

    try {
      // Отправляем как 'runTest' тип сообщения для совместимости с IPCServer
      const response = await this.sendRunTestRequest(testCase);

      return {
        success: response.success,
        output: response.output,
        error: response.error,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Отправить запрос runTest и дождаться ответа
   */
  private sendRunTestRequest(testCase: TestCase): Promise<ToolExecutionResponse> {
    return new Promise((resolve, reject) => {
      if (!this.state.connected || !this.socket) {
        reject(new Error('Not connected to IPC server'));
        return;
      }

      const requestId = randomUUID();
      const message: IPCMessage = {
        type: 'runTest',
        id: requestId,
        payload: {
          toolPath: testCase.toolPath,
          toolName: testCase.toolName,
          params: testCase.params || {},
          expected: testCase.expected,
        },
      };

      // Устанавливаем таймаут для запроса
      const timeout = setTimeout(() => {
        this.state.pendingRequests.delete(requestId);
        reject(new Error(`Request timeout for ${requestId}`));
      }, 30000);

      // Сохраняем pending request
      this.state.pendingRequests.set(requestId, { resolve, reject, timeout });

      // Отправляем сообщение
      const messageStr = JSON.stringify(message) + '\n';
      this.socket.write(messageStr, (error) => {
        if (error) {
          clearTimeout(timeout);
          this.state.pendingRequests.delete(requestId);
          reject(error);
        }
      });
    });
  }

  /**
   * Отправить команду shutdown
   */
  async shutdown(): Promise<void> {
    if (!this.state.connected || !this.socket) {
      return;
    }

    const message: IPCMessage = {
      type: 'shutdown',
      id: randomUUID(),
      payload: {},
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Shutdown timeout'));
      }, 5000);

      const messageStr = JSON.stringify(message) + '\n';
      this.socket!.write(messageStr, (error) => {
        clearTimeout(timeout);
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Отклонить все pending запросы
   */
  private rejectAllPending(reason: string): void {
    for (const [id, { reject, timeout }] of this.state.pendingRequests) {
      clearTimeout(timeout);
      reject(new Error(`Request ${id} rejected: ${reason}`));
    }
    this.state.pendingRequests.clear();
  }

  /**
   * Отключиться от сервера
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    this.state.connected = false;
    this.rejectAllPending('Disconnected');
    console.log('[IPCClient] Disconnected');
  }

  /**
   * Задержка
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default IPCClient;
