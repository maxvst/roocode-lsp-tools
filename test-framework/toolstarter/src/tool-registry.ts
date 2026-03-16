/**
 * Реестр custom tools
 * Эмулирует поведение RooCode CustomToolRegistry
 */

import * as vscode from 'vscode';
import type { 
  CustomToolDefinition, 
  CustomToolContext, 
  TaskLike,
  ToolRegistryState 
} from './types';
import { loadToolFromFile } from './tool-loader';

/**
 * Реестр загруженных custom tools
 */
export class ToolRegistry {
  private state: ToolRegistryState = {
    tools: new Map(),
    toolPaths: new Map(),
  };

  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Загружает tool из файла и регистрирует в реестре
   */
  async loadAndRegister(toolPath: string): Promise<{
    success: boolean;
    toolName?: string;
    error?: string;
  }> {
    const result = await loadToolFromFile(toolPath, this.workspaceRoot);

    if (!result.success || !result.tool) {
      return {
        success: false,
        error: result.error,
      };
    }

    const tool = result.tool;
    const existingPath = this.state.toolPaths.get(tool.name);
    
    if (existingPath) {
      // Tool с таким именем уже загружен
      console.log(`[ToolRegistry] Reloading tool "${tool.name}" from ${toolPath}`);
    }

    // Регистрируем tool
    this.state.tools.set(tool.name, tool);
    this.state.toolPaths.set(tool.name, toolPath);

    console.log(`[ToolRegistry] Registered tool "${tool.name}" from ${toolPath}`);

    return {
      success: true,
      toolName: tool.name,
    };
  }

  /**
   * Получает tool по имени
   */
  getTool(name: string): CustomToolDefinition | undefined {
    return this.state.tools.get(name);
  }

  /**
   * Проверяет наличие tool
   */
  hasTool(name: string): boolean {
    return this.state.tools.has(name);
  }

  /**
   * Возвращает список всех зарегистрированных tools
   */
  listTools(): string[] {
    return Array.from(this.state.tools.keys());
  }

  /**
   * Возвращает все зарегистрированные tools
   */
  getAllTools(): CustomToolDefinition[] {
    return Array.from(this.state.tools.values());
  }

  /**
   * Выполняет tool с заданными параметрами
   */
  async executeTool(
    name: string,
    params: unknown,
    context?: Partial<CustomToolContext>
  ): Promise<{
    success: boolean;
    result?: unknown;
    error?: string;
    duration: number;
  }> {
    const tool = this.state.tools.get(name);
    
    if (!tool) {
      return {
        success: false,
        error: `Tool "${name}" not found. Available tools: ${this.listTools().join(', ') || 'none'}`,
        duration: 0,
      };
    }

    // Создаем контекст выполнения (эмуляция RooCode)
    const executionContext: CustomToolContext = {
      mode: context?.mode ?? 'code',
      task: context?.task ?? createMockTask(),
    };

    const startTime = Date.now();

    try {
      // Валидация параметров через Zod (если есть схема)
      if (tool.parameters) {
        const validationResult = await validateParams(params, tool.parameters);
        if (!validationResult.valid) {
          return {
            success: false,
            error: `Parameter validation failed: ${validationResult.error}`,
            duration: Date.now() - startTime,
          };
        }
      }

      // Выполнение tool
      const result = await tool.execute(params, executionContext);
      
      const duration = Date.now() - startTime;
      console.log(`[ToolRegistry] Tool "${name}" executed in ${duration}ms`);

      return {
        success: true,
        result,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.error(`[ToolRegistry] Tool "${name}" failed:`, errorMessage);

      return {
        success: false,
        error: errorMessage,
        duration,
      };
    }
  }

  /**
   * Удаляет tool из реестра
   */
  unregister(name: string): boolean {
    if (!this.state.tools.has(name)) {
      return false;
    }

    this.state.tools.delete(name);
    this.state.toolPaths.delete(name);
    
    console.log(`[ToolRegistry] Unregistered tool "${name}"`);
    
    return true;
  }

  /**
   * Очищает весь реестр
   */
  clear(): void {
    this.state.tools.clear();
    this.state.toolPaths.clear();
    console.log('[ToolRegistry] Registry cleared');
  }

  /**
   * Возвращает состояние реестра (для отладки)
   */
  getState(): {
    toolCount: number;
    tools: Array<{ name: string; path: string }>;
  } {
    return {
      toolCount: this.state.tools.size,
      tools: this.listTools().map(name => ({
        name,
        path: this.state.toolPaths.get(name) ?? 'unknown',
      })),
    };
  }
}

/**
 * Создает мок задачи для контекста выполнения
 */
function createMockTask(): TaskLike {
  return {
    taskId: `test-task-${Date.now()}`,
  };
}

/**
 * Валидирует параметры через Zod схему
 */
async function validateParams(
  params: unknown,
  schema: unknown
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Проверяем, что schema имеет метод parse (Zod-подобный интерфейс)
    if (schema && typeof schema === 'object' && 'parse' in schema) {
      const zodSchema = schema as { parse: (p: unknown) => unknown };
      zodSchema.parse(params);
    }
    return { valid: true };
  } catch (error) {
    if (error instanceof Error) {
      // Извлекаем читаемое сообщение из Zod ошибки
      return {
        valid: false,
        error: error.message,
      };
    }
    return {
      valid: false,
      error: String(error),
    };
  }
}

/**
 * Глобальный экземпляр реестра
 */
let globalRegistry: ToolRegistry | null = null;

/**
 * Получает или создает глобальный реестр
 */
export function getGlobalRegistry(workspaceRoot?: string): ToolRegistry {
  if (!globalRegistry) {
    const root = workspaceRoot ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
    globalRegistry = new ToolRegistry(root);
  }
  return globalRegistry;
}

/**
 * Сбрасывает глобальный реестр (для тестов)
 */
export function resetGlobalRegistry(): void {
  if (globalRegistry) {
    globalRegistry.clear();
  }
  globalRegistry = null;
}
