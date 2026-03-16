/**
 * Загрузчик TypeScript файлов tools через esbuild
 * Эмулирует механизм загрузки RooCode
 */

import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';
import * as vm from 'vm';
import type { CustomToolDefinition, ToolLoadResult } from './types';

/**
 * Загружает TypeScript файл и извлекает CustomToolDefinition
 */
export async function loadToolFromFile(
  toolPath: string,
  workspaceRoot: string
): Promise<ToolLoadResult> {
  const absolutePath = path.isAbsolute(toolPath)
    ? toolPath
    : path.resolve(workspaceRoot, toolPath);

  // Проверяем существование файла
  if (!fs.existsSync(absolutePath)) {
    return {
      success: false,
      error: `Tool file not found: ${absolutePath}`,
    };
  }

  try {
    // Транспилируем через esbuild
    const transpiled = await transpileWithEsbuild(absolutePath);
    
    // Выполняем в изолированном контексте
    const moduleExports = executeInContext(transpiled, absolutePath);
    
    // Извлекаем tool definition
    const tool = extractToolDefinition(moduleExports);
    
    if (!tool) {
      return {
        success: false,
        error: `No valid CustomToolDefinition found in ${toolPath}. ` +
               `Export an object with name, description, and execute function.`,
      };
    }

    return {
      success: true,
      tool,
    };
  } catch (error) {
    return {
      success: false,
      error: formatError(error),
    };
  }
}

/**
 * Транспилирует TypeScript файл через esbuild
 */
async function transpileWithEsbuild(filePath: string): Promise<string> {
  const result = await esbuild.build({
    entryPoints: [filePath],
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    external: [
      // Node.js built-ins остаются внешними
      'fs',
      'path',
      'os',
      'util',
      'events',
      'stream',
      'http',
      'https',
      'url',
      'crypto',
      'zlib',
      'buffer',
      'child_process',
      'net',
      'tls',
      'dns',
      'readline',
      'repl',
      'vm',
      'module',
      'assert',
      'constants',
      'v8',
      'perf_hooks',
      'worker_threads',
      // VSCode API
      'vscode',
      // Zod (если используется в tool)
      'zod',
    ],
    define: {
      // Полифиллы для browser API если нужно
      'process.env.NODE_ENV': '"production"',
    },
    metafile: false,
    sourcemap: false,
    minify: false,
  });

  if (result.errors.length > 0) {
    throw new Error(
      `esbuild errors: ${result.errors.map(e => e.text).join(', ')}`
    );
  }

  const output = result.outputFiles[0];
  if (!output) {
    throw new Error('esbuild produced no output');
  }

  return output.text;
}

/**
 * Выполняет транспилированный код в изолированном контексте
 */
function executeInContext(code: string, filePath: string): Record<string, unknown> {
  // Создаем mock модули
  const mockModule = {
    exports: {} as Record<string, unknown>,
    require: (moduleName: string) => {
      // Пытаемся загрузить реальные модули для zod и других
      try {
        return require(moduleName);
      } catch {
        // Возвращаем mock для недоступных модулей
        console.warn(`[ToolLoader] Module "${moduleName}" not available, using mock`);
        return createMockModule(moduleName);
      }
    },
  };

  // Создаем контекст выполнения
  const context = vm.createContext({
    module: mockModule,
    exports: mockModule.exports,
    require: mockModule.require,
    __filename: filePath,
    __dirname: path.dirname(filePath),
    console: {
      log: (...args: unknown[]) => console.log('[Tool]', ...args),
      warn: (...args: unknown[]) => console.warn('[Tool]', ...args),
      error: (...args: unknown[]) => console.error('[Tool]', ...args),
    },
    // Глобальные объекты
    Buffer,
    URL,
    URLSearchParams,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    setImmediate,
    clearImmediate,
    process: {
      env: { NODE_ENV: 'test' },
      nextTick: process.nextTick.bind(process),
    },
  });

  // Выполняем код
  const script = new vm.Script(code, {
    filename: filePath,
  });

  script.runInContext(context);

  return mockModule.exports as Record<string, unknown>;
}

/**
 * Создает mock модуль для недоступных зависимостей
 */
function createMockModule(moduleName: string): unknown {
  // Zod mock - минимальная реализация для валидации
  if (moduleName === 'zod') {
    return createZodMock();
  }
  
  // Общий mock
  return new Proxy({}, {
    get: () => {
      throw new Error(`Module "${moduleName}" is not available in tool context`);
    },
  });
}

/**
 * Создает минимальный mock для Zod
 */
function createZodMock(): object {
  const createSchema = () => ({
    parse: (value: unknown) => value,
    safeParse: (value: unknown) => ({ success: true, data: value }),
    optional: () => createSchema(),
    nullable: () => createSchema(),
    array: () => createSchema(),
  });

  return {
    z: new Proxy({}, {
      get: (_target, prop) => {
        if (typeof prop === 'string') {
          return createSchema();
        }
        return undefined;
      },
    }),
    ZodSchema: class {},
    ZodError: class extends Error {
      constructor() {
        super('Zod validation error');
      }
    },
  };
}

/**
 * Извлекает CustomToolDefinition из экспорта модуля
 */
function extractToolDefinition(
  moduleExports: Record<string, unknown>
): CustomToolDefinition | null {
  // Вариант 1: default export
  if (moduleExports.default) {
    const def = moduleExports.default as Record<string, unknown>;
    if (isValidToolDefinition(def)) {
      return def as unknown as CustomToolDefinition;
    }
  }

  // Вариант 2: именованный export 'tool'
  if (moduleExports.tool) {
    const def = moduleExports.tool as Record<string, unknown>;
    if (isValidToolDefinition(def)) {
      return def as unknown as CustomToolDefinition;
    }
  }

  // Вариант 3: сам объект экспорта является tool definition
  if (isValidToolDefinition(moduleExports)) {
    return moduleExports as unknown as CustomToolDefinition;
  }

  // Вариант 4: ищем первый валидный tool в экспортах
  for (const value of Object.values(moduleExports)) {
    if (value && typeof value === 'object' && isValidToolDefinition(value as Record<string, unknown>)) {
      return value as unknown as CustomToolDefinition;
    }
  }

  return null;
}

/**
 * Проверяет валидность структуры CustomToolDefinition
 */
function isValidToolDefinition(obj: Record<string, unknown> | null | undefined): boolean {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  // Обязательные поля: name, description, execute
  if (typeof obj.name !== 'string' || obj.name.trim() === '') {
    return false;
  }
  
  if (typeof obj.description !== 'string' || obj.description.trim() === '') {
    return false;
  }
  
  if (typeof obj.execute !== 'function') {
    return false;
  }

  // parameters опционален, но если есть - должен быть объектом
  if (obj.parameters !== undefined && typeof obj.parameters !== 'object') {
    return false;
  }

  return true;
}

/**
 * Форматирует ошибку для вывода
 */
function formatError(error: unknown): string {
  if (error instanceof Error) {
    let message = error.message;
    
    if (error.stack) {
      // Добавляем первую строку стека для контекста
      const stackLines = error.stack.split('\n');
      const relevantLine = stackLines.find(line => 
        line.includes('.ts:') || line.includes('at ')
      );
      if (relevantLine) {
        message += ` (${relevantLine.trim()})`;
      }
    }
    
    return message;
  }
  
  return String(error);
}

/**
 * Очищает кэш загруженных модулей (для hot reload)
 */
export function clearModuleCache(): void {
  // В текущей реализации кэширование не используется
  // При необходимости можно добавить кэш с инвалидацией
}
