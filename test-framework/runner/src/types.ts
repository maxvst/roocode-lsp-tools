/**
 * Типы и интерфейсы для Isolated Runner
 */

// === Test Case Definition ===

/**
 * Тест-кейс для выполнения в изолированном VSCode
 */
export interface TestCase {
  /** Путь к тестируемому tool (относительный или абсолютный) */
  toolPath: string;
  /** Имя tool */
  toolName: string;
  /** Аргументы для передачи в tool */
  params?: Record<string, unknown>;
  /** Ожидаемый результат */
  expected?: ExpectedResult;
}

/**
 * Ожидаемый результат выполнения теста
 */
export interface ExpectedResult {
  /** Результат должен содержать строку */
  contains?: string;
  /** Результат должен соответствовать regex */
  matches?: string;
  /** Результат должен быть равен значению */
  equals?: unknown;
  /** Проверка JSON Schema */
  jsonSchema?: object;
}

/**
 * Результат выполнения теста
 */
export interface TestResult {
  /** Успешность выполнения */
  success: boolean;
  /** Результат выполнения tool */
  output?: unknown;
  /** Сообщение об ошибке */
  error?: string;
  /** Длительность выполнения в ms */
  duration: number;
}

// === IPC Protocol ===

/**
 * IPC сообщение
 */
export interface IPCMessage {
  /** Тип сообщения */
  type: string;
  /** Уникальный ID сообщения */
  id?: string;
  /** Полезная нагрузка */
  payload: unknown;
}

/**
 * Запрос на выполнение tool
 */
export interface ToolExecutionRequest {
  /** ID запроса */
  id: string;
  /** Имя tool */
  toolName: string;
  /** Аргументы */
  args: Record<string, unknown>;
  /** Контекст выполнения */
  context: MockContext;
}

/**
 * Ответ на выполнение tool
 */
export interface ToolExecutionResponse {
  /** ID запроса */
  id?: string;
  /** Успешность */
  success: boolean;
  /** Результат (если success=true) */
  result?: string;
  /** Выходные данные (альтернатива result) */
  output?: unknown;
  /** Ошибка (если success=false) */
  error?: string;
  /** Время выполнения (ms) */
  duration: number;
}

// === Mock Context ===

/**
 * Мок контекста для имитации RooCode
 */
export interface MockContext {
  /** Текущий режим */
  mode: string;
  /** Мок задачи */
  task: MockTask;
}

/**
 * Мок задачи TaskLike
 */
export interface MockTask {
  /** ID задачи */
  taskId: string;
}

// === Runner Configuration ===

/**
 * Конфигурация Isolated Runner
 */
export interface IsolatedRunnerConfig {
  /** Путь к code бинарнику (по умолчанию: 'code') */
  vscodePath?: string;
  /** Директория для user data VSCode */
  userDataDir: string;
  /** Директория для extensions VSCode */
  extensionsDir?: string;
  /** Путь к ToolStarter extension */
  extensionDevelopmentPath: string;
  /** Тестовый workspace */
  workspaceDir: string;
  /** Таймаут запуска (ms) */
  timeout?: number;
  /** Порт для IPC (по умолчанию: 9234) */
  ipcPort?: number;
}

/**
 * Состояние runner'а
 */
export interface RunnerState {
  /** Запущен ли VSCode */
  isRunning: boolean;
  /** PID процесса VSCode */
  pid?: number;
  /** Подключен ли IPC */
  ipcConnected: boolean;
  /** Время запуска */
  startTime?: number;
}

// === Events ===

/**
 * Событие загрузки tool
 */
export interface ToolLoadedEvent {
  type: 'tool:loaded';
  tools: string[];
}

/**
 * Событие ошибки tool
 */
export interface ToolErrorEvent {
  type: 'tool:error';
  toolName: string;
  error: string;
}

/**
 * Все возможные события от extension
 */
export type ExtensionEvent = ToolLoadedEvent | ToolErrorEvent;

// === Internal Types ===

/**
 * Внутреннее состояние IPC клиента
 */
export interface IPCClientState {
  connected: boolean;
  pendingRequests: Map<string, {
    resolve: (value: ToolExecutionResponse) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>;
}

/**
 * Результат запуска VSCode
 */
export interface VSCodeLaunchResult {
  success: boolean;
  pid?: number;
  error?: string;
}
