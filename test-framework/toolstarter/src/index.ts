/**
 * ToolStarter Extension - Public API
 * Экспорты для использования в тестах и других модулях
 */

// Основные классы
export { ToolRegistry, getGlobalRegistry, resetGlobalRegistry } from './tool-registry';
export { IPCServer, getGlobalIPCServer, resetGlobalIPCServer } from './ipc-server';

// Утилиты
export { validateResult } from './validator';
export { loadToolFromFile, clearModuleCache } from './tool-loader';

// Типы
export type {
  CustomToolDefinition,
  CustomToolContext,
  TaskLike,
  IPCMessage,
  ToolExecutionRequest,
  ToolExecutionResponse,
  ExpectedResult,
  ValidationResult,
  ToolLoadResult,
  ServerReadyEvent,
  ServerErrorEvent,
  TestResultEvent,
  OutgoingIPCMessage,
  ToolStarterConfig,
  IPCServerState,
  ToolRegistryState,
} from './types';
