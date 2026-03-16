/**
 * Типы и интерфейсы для ToolStarter Extension
 * Совместимы с test-framework/runner/src/types.ts
 */

import type { ZodSchema } from 'zod';

// === Custom Tool Definition (RooCode Protocol) ===

/**
 * Определение custom tool по протоколу RooCode
 */
export interface CustomToolDefinition {
  /** Уникальное имя tool */
  name: string;
  /** Описание для AI модели */
  description: string;
  /** Zod-схема для валидации параметров (опционально) */
  parameters?: ZodSchema;
  /** Функция выполнения */
  execute: (params: unknown, context: CustomToolContext) => Promise<unknown>;
}

/**
 * Контекст выполнения custom tool
 */
export interface CustomToolContext {
  /** Текущий режим (code, architect, etc.) */
  mode: string;
  /** Ссылка на задачу */
  task: TaskLike;
}

/**
 * Минимальный интерфейс задачи (TaskLike)
 */
export interface TaskLike {
  /** ID задачи */
  taskId: string;
}

// === IPC Protocol ===

/**
 * IPC сообщение
 */
export interface IPCMessage<T = unknown> {
  /** Тип сообщения */
  type: string;
  /** Полезная нагрузка */
  payload: T;
}

/**
 * Запрос на выполнение tool
 */
export interface ToolExecutionRequest {
  /** Относительный путь к .ts файлу tool */
  toolPath: string;
  /** Имя tool для вызова */
  toolName: string;
  /** Параметры выполнения */
  params?: Record<string, unknown>;
  /** Критерии валидации результата */
  expected?: ExpectedResult;
}

/**
 * Ответ с результатом выполнения
 */
export interface ToolExecutionResponse {
  /** Успешность валидации */
  success: boolean;
  /** Результат выполнения tool */
  output?: unknown;
  /** Ошибка выполнения или валидации */
  error?: string;
  /** Время выполнения в ms */
  duration: number;
}

// === Validation ===

/**
 * Критерии ожидаемого результата
 */
export interface ExpectedResult {
  /** Результат должен содержать подстроку */
  contains?: string;
  /** Результат должен соответствовать regex */
  matches?: string;
  /** Точное совпадение */
  equals?: unknown;
  /** Валидация по JSON Schema */
  jsonSchema?: object;
}

/**
 * Результат валидации
 */
export interface ValidationResult {
  /** Прошла ли валидация */
  valid: boolean;
  /** Сообщение об ошибке (если не прошла) */
  error?: string;
}

// === Tool Loader ===

/**
 * Результат загрузки tool
 */
export interface ToolLoadResult {
  /** Успешность загрузки */
  success: boolean;
  /** Загруженное определение tool */
  tool?: CustomToolDefinition;
  /** Ошибка загрузки */
  error?: string;
}

// === IPC Server Events ===

/**
 * Событие готовности сервера
 */
export interface ServerReadyEvent {
  type: 'ready';
  payload: {
    port: number;
  };
}

/**
 * Событие ошибки
 */
export interface ServerErrorEvent {
  type: 'error';
  payload: {
    message: string;
    details?: unknown;
  };
}

/**
 * Событие результата теста
 */
export interface TestResultEvent {
  type: 'testResult';
  payload: ToolExecutionResponse;
}

/**
 * Все исходящие события
 */
export type OutgoingIPCMessage = 
  | ServerReadyEvent 
  | ServerErrorEvent 
  | TestResultEvent;

// === Configuration ===

/**
 * Конфигурация ToolStarter
 */
export interface ToolStarterConfig {
  /** TCP порт для IPC сервера */
  port: number;
  /** Автозапуск сервера при активации */
  autoStart: boolean;
  /** Таймаут выполнения tool (ms) */
  timeout: number;
}

// === Internal State ===

/**
 * Состояние IPC сервера
 */
export interface IPCServerState {
  /** Запущен ли сервер */
  running: boolean;
  /** Порт прослушивания */
  port?: number;
  /** Активные соединения */
  connections: number;
}

/**
 * Реестр загруженных tools
 */
export interface ToolRegistryState {
  /** Загруженные tools по имени */
  tools: Map<string, CustomToolDefinition>;
  /** Пути к загруженным tools */
  toolPaths: Map<string, string>;
}
