/**
 * Типы и интерфейсы для Test Logic Layer
 */

// === Test Case Definition (YAML format) ===

/**
 * Файл тест-кейса в формате YAML
 */
export interface TestCaseFile {
  /** Название набора тестов */
  name: string;
  /** Описание набора */
  description?: string;
  /** Автор */
  author?: string;
  /** Версия */
  version?: string;
  /** Настройки окружения */
  environment?: TestCaseEnvironment;
  /** Тестовые сценарии */
  testCases: TestCaseDefinition[];
}

/**
 * Настройки окружения для тестов
 */
export interface TestCaseEnvironment {
  /** Версия Node.js */
  nodeVersion?: string;
  /** Таймаут по умолчанию (ms) */
  timeout?: number;
}

/**
 * Определение отдельного тест-кейса
 */
export interface TestCaseDefinition {
  /** Уникальный ID теста */
  id: string;
  /** Описание теста */
  description?: string;
  /** Путь к тестируемому tool (относительный от корня проекта) */
  toolPath: string;
  /** Имя tool */
  toolName: string;
  /** Аргументы для передачи в tool */
  params?: Record<string, unknown>;
  /** Контекст выполнения */
  context?: TestContext;
  /** Ожидаемый результат */
  expected?: ExpectedResult;
  /** Таймаут выполнения (ms) */
  timeout?: number;
}

/**
 * Контекст выполнения теста
 */
export interface TestContext {
  /** Режим (code, architect, etc.) */
  mode?: string;
}

// === Expected Result Matchers ===

/**
 * Ожидаемый результат выполнения
 */
export interface ExpectedResult {
  /** Результат должен содержать подстроку */
  contains?: string;
  /** Результат должен оканчиваться строкой */
  endsWith?: string;
  /** Результат должен соответствовать regex паттерну */
  matches?: string;
  /** Точное совпадение */
  equals?: unknown;
  /** Валидация по JSON Schema */
  jsonSchema?: object;
  /** Ожидается успех (по умолчанию true) */
  success?: boolean;
  /** Проверка длительности */
  duration?: DurationMatcher;
  /** Путь или массив путей, которые должны существовать */
  fileExists?: string | string[];
  /** Путь или массив путей, которых не должно быть */
  fileNotExists?: string | string[];
}

/**
 * Матчер для проверки длительности
 */
export interface DurationMatcher {
  /** Меньше чем (ms) */
  lessThan?: number;
  /** Больше чем (ms) */
  greaterThan?: number;
  /** В диапазоне (ms) */
  between?: [number, number];
}

// === Execution Results ===

/**
 * Результат выполнения теста
 */
export interface TestExecutionResult {
  /** ID тест-кейса */
  testId: string;
  /** Описание теста */
  description?: string;
  /** Имя набора тестов */
  suiteName: string;
  /** Имя tool */
  toolName?: string;
  /** Параметры, переданные в tool */
  params?: Record<string, unknown>;
  /** Успешность */
  success: boolean;
  /** Результат выполнения tool */
  output?: unknown;
  /** Ошибка выполнения */
  error?: string;
  /** Длительность выполнения (ms) */
  duration: number;
  /** Результат валидации */
  validation?: ValidationResult;
  /** Время выполнения */
  timestamp: string;
}

/**
 * Результат валидации
 */
export interface ValidationResult {
  /** Прошла ли валидация */
  passed: boolean;
  /** Тип матчера */
  matcher?: string;
  /** Ожидаемое значение */
  expected?: unknown;
  /** Фактическое значение */
  actual?: unknown;
  /** Сообщение об ошибке */
  error?: string;
}

/**
 * Отчёт о выполнении тестов
 */
export interface TestReport {
  /** Время генерации отчёта */
  timestamp: string;
  /** Общее количество тестов */
  totalTests: number;
  /** Количество пройденных */
  passed: number;
  /** Количество проваленных */
  failed: number;
  /** Количество пропущенных */
  skipped: number;
  /** Общая длительность (ms) */
  duration: number;
  /** Результаты по каждому тесту */
  results: TestExecutionResult[];
}

// === CLI Options ===

/**
 * Опции CLI для запуска тестов
 */
export interface CLIOptions {
  /** Путь к файлу или директории с тестами */
  file?: string;
  /** Детальный вывод */
  verbose?: boolean;
  /** Таймаут выполнения (ms) */
  timeout?: number;
  /** Количество параллельных потоков */
  parallel?: number;
  /** Формат отчёта */
  reporter?: 'console' | 'junit';
  /** Путь для сохранения отчёта */
  output?: string;
  /** Путь к workspace */
  workspace?: string;
}

// === Runner Configuration ===

/**
 * Конфигурация Test Runner
 */
export interface TestRunnerConfig {
  /** Директория с тест-кейсами */
  testCasesDir: string;
  /** Директория для user data VSCode */
  userDataDir: string;
  /** Путь к ToolStarter extension */
  extensionDevelopmentPath: string;
  /** Тестовый workspace */
  workspaceDir: string;
  /** Таймаут по умолчанию (ms) */
  timeout?: number;
  /** Количество параллельных потоков */
  parallel?: number;
  /** Детальный вывод */
  verbose?: boolean;
}

// === Internal Types ===

/**
 * Загруженный тест-кейс с разрешёнными путями
 */
export interface ResolvedTestCase {
  /** Исходное определение */
  definition: TestCaseDefinition;
  /** Имя набора тестов */
  suiteName: string;
  /** Абсолютный путь к tool */
  resolvedToolPath: string;
  /** Исходный файл тест-кейса */
  sourceFile: string;
}

/**
 * Статистика выполнения
 */
export interface ExecutionStats {
  /** Время начала */
  startTime: number;
  /** Время окончания */
  endTime?: number;
  /** Количество выполненных тестов */
  executed: number;
  /** Количество успешных */
  passed: number;
  /** Количество проваленных */
  failed: number;
}
