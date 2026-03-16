/**
 * Isolated Runner - точка входа
 * 
 * Управляет жизненным циклом изолированного экземпляра VSCode
 * и обеспечивает IPC коммуникацию с ToolStarter extension.
 */

import { VSCodeManager } from './vscode-manager';
import { IPCClient } from './ipc-client';
import {
  IsolatedRunnerConfig,
  TestCase,
  TestResult,
  RunnerState,
  ExtensionEvent,
} from './types';

export {
  VSCodeManager,
  IPCClient,
};

export type {
  IsolatedRunnerConfig,
  TestCase,
  TestResult,
  RunnerState,
  ExtensionEvent,
};

/**
 * Isolated Runner - главный класс для управления тестовым окружением
 */
export class IsolatedRunner {
  private vscodeManager: VSCodeManager;
  private ipcClient: IPCClient;
  private config: IsolatedRunnerConfig;

  constructor(config: IsolatedRunnerConfig) {
    this.config = {
      timeout: 30000,
      ipcPort: 9234,
      ...config,
    };
    
    this.vscodeManager = new VSCodeManager(this.config);
    this.ipcClient = new IPCClient(this.config.ipcPort);
  }

  /**
   * Запустить изолированный VSCode и подключиться к IPC
   */
  async start(): Promise<void> {
    console.log('[IsolatedRunner] Starting...');

    // Запускаем VSCode
    const result = await this.vscodeManager.start();
    if (!result.success) {
      throw new Error(`Failed to start VSCode: ${result.error}`);
    }

    // Ждём и подключаемся к IPC
    console.log('[IsolatedRunner] Connecting to IPC...');
    await this.ipcClient.connect(15, 2000); // 15 попыток, 2 секунды между ними

    console.log('[IsolatedRunner] Started successfully');
  }

  /**
   * Остановить VSCode и отключиться от IPC
   */
  async stop(): Promise<void> {
    console.log('[IsolatedRunner] Stopping...');

    // Сначала отключаем IPC
    try {
      await this.ipcClient.shutdown();
    } catch (error) {
      console.warn('[IsolatedRunner] IPC shutdown error:', error);
    }
    this.ipcClient.disconnect();

    // Затем останавливаем VSCode
    await this.vscodeManager.stop();

    console.log('[IsolatedRunner] Stopped');
  }

  /**
   * Выполнить тест
   */
  async runTest(testCase: TestCase): Promise<TestResult> {
    if (!this.ipcClient.isConnected()) {
      throw new Error('IPC client is not connected');
    }

    console.log(`[IsolatedRunner] Running test: ${testCase.toolName}`);
    return this.ipcClient.runTest(testCase);
  }

  /**
   * Выполнить несколько тестов
   */
  async runTests(testCases: TestCase[]): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.runTest(testCase);
      results.push(result);
    }

    return results;
  }

  /**
   * Проверить, запущен ли runner
   */
  isRunning(): boolean {
    return this.vscodeManager.isRunning() && this.ipcClient.isConnected();
  }

  /**
   * Получить состояние runner'а
   */
  getState(): RunnerState {
    return {
      ...this.vscodeManager.getState(),
      ipcConnected: this.ipcClient.isConnected(),
    };
  }

  /**
   * Подписаться на события от extension
   */
  on(eventType: string, handler: (event: ExtensionEvent) => void): void {
    this.ipcClient.on(eventType, handler);
  }

  /**
   * Отписаться от событий
   */
  off(eventType: string, handler: (event: ExtensionEvent) => void): void {
    this.ipcClient.off(eventType, handler);
  }

  /**
   * Принудительно завершить все процессы
   */
  kill(): void {
    this.ipcClient.disconnect();
    this.vscodeManager.kill();
  }
}

/**
 * Создать экземпляр IsolatedRunner
 */
export function createRunner(config: IsolatedRunnerConfig): IsolatedRunner {
  return new IsolatedRunner(config);
}

export default IsolatedRunner;
