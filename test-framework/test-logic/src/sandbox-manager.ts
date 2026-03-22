/**
 * SandboxManager - управление изоляцией файловой системы для тестов
 * 
 * Создаёт временную копию test-workspace и обеспечивает:
 * - Изоляцию тестов от оригинальных файлов
 * - Восстановление состояния между тестами
 * - Автоматическую очистку при завершении
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';

// Тип для tree-sync (используем any для динамического CommonJS модуля)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TreeSyncType = any;

// Динамический импорт CommonJS модуля (ESM compatible)
let TreeSync: TreeSyncType = null;

async function loadTreeSync(): Promise<TreeSyncType> {
  if (!TreeSync) {
    const module = await import('tree-sync');
    TreeSync = module.default || module;
  }
  return TreeSync;
}

/**
 * Конфигурация песочницы
 */
export interface SandboxConfig {
  /** Путь к оригинальному test-workspace */
  originalWorkspace: string;
  /** Флаг --keep-temp для отладки (сохранить временную директорию) */
  keepTemp?: boolean;
  /** Базовая директория для временных папок (по умолчанию: рядом с оригиналом) */
  tempBaseDir?: string;
  /** Префикс имени временной директории */
  tempPrefix?: string;
}

/**
 * Состояние песочницы
 */
export interface SandboxState {
  /** Путь к временной директории */
  tempDir: string;
  /** Статус инициализации */
  isInitialized: boolean;
  /** Время создания */
  createdAt?: Date;
}

/**
 * Класс для управления жизненным циклом песочницы
 */
export class SandboxManager {
  private config: SandboxConfig;
  private state: SandboxState;
  private shutdownHandlersSetup: boolean = false;

  /**
   * Создаёт экземпляр SandboxManager
   * @param config - конфигурация песочницы
   */
  constructor(config: SandboxConfig) {
    this.config = {
      tempPrefix: '.sandbox-tmp-',
      ...config,
    };
    this.state = {
      tempDir: '',
      isInitialized: false,
    };
  }

  /**
   * Создаёт временную копию workspace с timestamp в имени
   * @returns путь к временной директории
   */
  async initialize(): Promise<string> {
    if (this.state.isInitialized) {
      console.log('[SandboxManager] Already initialized, returning existing temp dir');
      return this.state.tempDir;
    }

    const timestamp = Date.now();
    const baseDir = this.config.tempBaseDir || path.dirname(this.config.originalWorkspace);
    const tempDirName = `${this.config.tempPrefix}${timestamp}`;
    const tempDir = path.join(baseDir, tempDirName);

    console.log(`[SandboxManager] Creating sandbox: ${tempDir}`);
    console.log(`[SandboxManager] Source: ${this.config.originalWorkspace}`);

    try {
      // Копируем оригинальный workspace во временную директорию
      await fs.cp(this.config.originalWorkspace, tempDir, { 
        recursive: true,
        filter: (src) => {
          // Исключаем служебные директории и файлы
          const basename = path.basename(src);
          return !basename.startsWith('.git') && 
                 basename !== 'node_modules' &&
                 basename !== '.DS_Store';
        }
      });

      this.state = {
        tempDir,
        isInitialized: true,
        createdAt: new Date(),
      };

      // Устанавливаем обработчики завершения процесса
      this.setupShutdownHandlers();

      console.log(`[SandboxManager] Sandbox created successfully`);
      return tempDir;
    } catch (error) {
      console.error(`[SandboxManager] Failed to create sandbox:`, error);
      throw new Error(`Failed to create sandbox: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Синхронизирует временную директорию с оригиналом (восстановление состояния)
   * Использует tree-sync для эффективной синхронизации
   */
  async reset(): Promise<void> {
    if (!this.state.isInitialized) {
      throw new Error('Sandbox is not initialized. Call initialize() first.');
    }

    console.log(`[SandboxManager] Resetting sandbox to original state`);

    try {
      // Используем tree-sync для синхронизации (асинхронная загрузка ESM)
      const TreeSyncModule = await loadTreeSync();
      const tree = new TreeSyncModule(this.config.originalWorkspace, this.state.tempDir);
      tree.sync();
      
      console.log(`[SandboxManager] Sandbox reset completed`);
    } catch (error) {
      console.error(`[SandboxManager] Failed to reset sandbox:`, error);
      throw new Error(`Failed to reset sandbox: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Удаляет временную директорию (если не установлен флаг keepTemp)
   */
  async cleanup(): Promise<void> {
    if (!this.state.isInitialized || !this.state.tempDir) {
      console.log(`[SandboxManager] No sandbox to cleanup`);
      return;
    }

    if (this.config.keepTemp) {
      console.log(`[SandboxManager] Keeping temp dir: ${this.state.tempDir}`);
      return;
    }

    console.log(`[SandboxManager] Cleaning up sandbox: ${this.state.tempDir}`);

    try {
      await fs.rm(this.state.tempDir, { recursive: true, force: true });
      
      this.state = {
        tempDir: '',
        isInitialized: false,
      };

      console.log(`[SandboxManager] Sandbox cleaned up successfully`);
    } catch (error) {
      console.error(`[SandboxManager] Failed to cleanup sandbox:`, error);
      // Не выбрасываем ошибку при очистке - логируем и продолжаем
    }
  }

  /**
   * Возвращает путь к временной директории
   * @returns путь к временной директории или пустую строку, если не инициализирована
   */
  getTempDir(): string {
    return this.state.tempDir;
  }

  /**
   * Возвращает текущее состояние песочницы
   * @returns состояние песочницы
   */
  getState(): SandboxState {
    return { ...this.state };
  }

  /**
   * Проверяет, инициализирована ли песочница
   * @returns true если песочница готова к использованию
   */
  isInitialized(): boolean {
    return this.state.isInitialized;
  }

  /**
   * Устанавливает обработчики сигналов процесса для graceful shutdown
   * Гарантирует очистку временной директории при аварийном завершении
   */
  setupShutdownHandlers(): void {
    if (this.shutdownHandlersSetup) {
      return;
    }

    const handler = async () => {
      console.log(`[SandboxManager] Received shutdown signal, cleaning up...`);
      await this.cleanup();
    };

    process.on('SIGINT', handler);
    process.on('SIGTERM', handler);
    process.on('exit', handler);

    this.shutdownHandlersSetup = true;
    console.log(`[SandboxManager] Shutdown handlers registered`);
  }

  /**
   * Удаляет обработчики сигналов процесса
   * Полезно при тестировании или при явном управлении жизненным циклом
   */
  removeShutdownHandlers(): void {
    if (!this.shutdownHandlersSetup) {
      return;
    }

    const handler = async () => {
      await this.cleanup();
    };

    process.off('SIGINT', handler);
    process.off('SIGTERM', handler);
    process.off('exit', handler);

    this.shutdownHandlersSetup = false;
    console.log(`[SandboxManager] Shutdown handlers removed`);
  }
}

/**
 * Создаёт экземпляр SandboxManager с настройками по умолчанию
 * @param config - конфигурация песочницы
 * @returns настроенный экземпляр SandboxManager
 */
export function createSandboxManager(config: SandboxConfig): SandboxManager {
  return new SandboxManager(config);
}

export default SandboxManager;
