/**
 * VSCode Manager - управление жизненным циклом изолированного VSCode процесса
 */

import { spawn, ChildProcess, execSync } from 'child_process';
import { rmSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  IsolatedRunnerConfig,
  RunnerState,
  VSCodeLaunchResult,
} from './types';

/**
 * Менеджер изолированного VSCode процесса
 */
export class VSCodeManager {
  private config: IsolatedRunnerConfig;
  private process: ChildProcess | null = null;
  private state: RunnerState;
  private shutdownHandlers: (() => void)[] = [];
  private tempDirs: string[] = [];

  constructor(config: IsolatedRunnerConfig) {
    this.config = {
      vscodePath: 'code',
      timeout: 30000,
      ipcPort: 9234,
      ...config,
    };
    this.state = {
      isRunning: false,
      ipcConnected: false,
    };
  }

  /**
   * Получить текущее состояние
   */
  getState(): RunnerState {
    return { ...this.state };
  }

  /**
   * Проверить, запущен ли VSCode
   */
  isRunning(): boolean {
    return this.state.isRunning && this.process !== null;
  }

  /**
   * Подготовить директорию user data с минимальной конфигурацией
   */
  private setupUserDataDir(): void {
    const userDataDir = this.config.userDataDir;
    
    // Создаём структуру директорий
    mkdirSync(join(userDataDir, 'User'), { recursive: true });
    
    // Минимальные настройки для отключения приветственных экранов
    const settings = {
      'workbench.startupEditor': 'none',
      'workbench.welcomePage.walkthroughs.openOnInstall': false,
      'workbench.tips.enabled': false,
      'extensions.autoUpdate': false,
      'extensions.autoCheckUpdates': false,
      'update.mode': 'none',
      'telemetry.telemetryLevel': 'off',
    };
    
    writeFileSync(
      join(userDataDir, 'User', 'settings.json'),
      JSON.stringify(settings, null, 2)
    );

    // Отключаем приветственные экраны
    const argv = [
      '--skip-welcome',
      '--skip-release-notes',
      '--disable-workspace-trust',
      '--no-sandbox',
      '--disable-gpu-sandbox',
    ];
    
    // Сохраняем argv.json для storage
    mkdirSync(join(userDataDir, 'argv'), { recursive: true });
    writeFileSync(
      join(userDataDir, 'argv', 'argv.json'),
      JSON.stringify({ argv })
    );
  }

  /**
   * Найти путь к VSCode бинарнику
   */
  private findVSCodePath(): string {
    const vscodePath = this.config.vscodePath || 'code';
    
    try {
      // Проверяем, что команда доступна
      execSync(`which ${vscodePath}`, { encoding: 'utf-8' });
      return vscodePath;
    } catch {
      // Пробуем альтернативные пути
      const alternatives = [
        '/usr/bin/code',
        '/usr/local/bin/code',
        '/snap/bin/code',
        '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code',
        process.env.VSCODE_PATH,
      ];
      
      for (const alt of alternatives) {
        if (alt && existsSync(alt)) {
          return alt;
        }
      }
      
      throw new Error(
        `VSCode binary not found. Tried: ${vscodePath}, ${alternatives.filter(Boolean).join(', ')}`
      );
    }
  }

  /**
   * Запустить VSCode
   */
  async start(): Promise<VSCodeLaunchResult> {
    if (this.isRunning()) {
      return { success: true, pid: this.state.pid };
    }

    try {
      // Подготавливаем директории
      if (!existsSync(this.config.userDataDir)) {
        mkdirSync(this.config.userDataDir, { recursive: true });
      }
      this.setupUserDataDir();

      const vscodePath = this.findVSCodePath();
      
      // Аргументы запуска VSCode
      const args = [
        '--user-data-dir', this.config.userDataDir,
        '--extensionDevelopmentPath', this.config.extensionDevelopmentPath,
        '--skip-welcome',
        '--skip-release-notes',
        '--disable-workspace-trust',
        '--no-sandbox',
        '--disable-gpu-sandbox',
        '--new-window',
        this.config.workspaceDir,
      ];

      console.log(`[VSCodeManager] Starting VSCode: ${vscodePath} ${args.join(' ')}`);

      // Запускаем процесс
      this.process = spawn(vscodePath, args, {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          // Передаём порт IPC в extension через env
          TOOLSTARTER_IPC_PORT: String(this.config.ipcPort),
        },
      });

      // Обработка событий процесса
      this.setupProcessHandlers();

      // Ждём готовности процесса
      await this.waitForReady();

      this.state.isRunning = true;
      this.state.pid = this.process.pid;
      this.state.startTime = Date.now();

      console.log(`[VSCodeManager] VSCode started with PID: ${this.state.pid}`);

      return { success: true, pid: this.state.pid };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[VSCodeManager] Failed to start VSCode: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Настроить обработчики событий процесса
   */
  private setupProcessHandlers(): void {
    if (!this.process) return;

    this.process.stdout?.on('data', (data) => {
      console.log(`[VSCode stdout] ${data.toString().trim()}`);
    });

    this.process.stderr?.on('data', (data) => {
      console.error(`[VSCode stderr] ${data.toString().trim()}`);
    });

    this.process.on('error', (error) => {
      console.error(`[VSCodeManager] Process error: ${error.message}`);
      this.state.isRunning = false;
      this.state.pid = undefined;
    });

    this.process.on('exit', (code, signal) => {
      console.log(`[VSCodeManager] Process exited: code=${code}, signal=${signal}`);
      this.state.isRunning = false;
      this.state.pid = undefined;
      this.process = null;
    });

    // Обработка сигналов завершения
    const handleShutdown = () => {
      console.log('[VSCodeManager] Received shutdown signal');
      this.stop().catch(console.error);
    };

    process.on('SIGTERM', handleShutdown);
    process.on('SIGINT', handleShutdown);
    this.shutdownHandlers.push(() => {
      process.off('SIGTERM', handleShutdown);
      process.off('SIGINT', handleShutdown);
    });
  }

  /**
   * Ждать готовности процесса VSCode
   */
  private async waitForReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = this.config.timeout || 30000;
      const timer = setTimeout(() => {
        reject(new Error(`VSCode startup timeout after ${timeout}ms`));
      }, timeout);

      // Проверяем, что процесс запустился (есть PID)
      const checkReady = () => {
        if (this.process && this.process.pid) {
          clearTimeout(timer);
          resolve();
        }
      };

      // Даём процессу время на запуск
      setTimeout(checkReady, 1000);

      // Если процесс упал до таймаута
      this.process?.on('exit', (code) => {
        if (code !== 0 && code !== null) {
          clearTimeout(timer);
          reject(new Error(`VSCode exited with code ${code}`));
        }
      });
    });
  }

  /**
   * Остановить VSCode
   */
  async stop(): Promise<void> {
    if (!this.process) {
      console.log('[VSCodeManager] No process to stop');
      return;
    }

    console.log('[VSCodeManager] Stopping VSCode...');

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('[VSCodeManager] Force killing VSCode...');
        this.process?.kill('SIGKILL');
      }, 5000);

      this.process?.on('exit', () => {
        clearTimeout(timeout);
        this.state.isRunning = false;
        this.state.pid = undefined;
        this.process = null;
        this.cleanup();
        console.log('[VSCodeManager] VSCode stopped');
        resolve();
      });

      // Graceful shutdown
      this.process?.kill('SIGTERM');
    });
  }

  /**
   * Очистка временных директорий
   */
  private cleanup(): void {
    // Удаляем обработчики сигналов
    this.shutdownHandlers.forEach((handler) => handler());
    this.shutdownHandlers = [];

    // Удаляем временные директории
    for (const dir of this.tempDirs) {
      try {
        rmSync(dir, { recursive: true, force: true });
        console.log(`[VSCodeManager] Cleaned up temp dir: ${dir}`);
      } catch (error) {
        console.warn(`[VSCodeManager] Failed to cleanup ${dir}:`, error);
      }
    }
    this.tempDirs = [];
  }

  /**
   * Принудительно завершить процесс
   */
  kill(): void {
    if (this.process) {
      this.process.kill('SIGKILL');
      this.state.isRunning = false;
      this.state.pid = undefined;
      this.process = null;
    }
    this.cleanup();
  }
}

export default VSCodeManager;
