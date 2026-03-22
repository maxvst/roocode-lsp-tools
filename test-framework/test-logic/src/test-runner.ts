/**
 * Test Runner - главный класс для запуска тестов
 *
 * Интегрируется с IsolatedRunner для выполнения тестов в VSCode
 * Использует SandboxManager для изоляции файловой системы
 */

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { TestCaseLoader } from './test-case-loader.js';
import { ConsoleReporter, JUnitReporter } from './reporter.js';
import { SandboxManager, createSandboxManager } from './sandbox-manager.js';
import {
  TestRunnerConfig,
  ResolvedTestCase,
  TestReport,
  TestExecutionResult,
  ValidationResult,
  ExpectedResult,
} from './types.js';

// === Локальные типы для IsolatedRunner (динамический импорт) ===

/**
 * Конфигурация Isolated Runner
 */
interface IsolatedRunnerConfig {
  vscodePath?: string;
  userDataDir: string;
  extensionsDir?: string;
  extensionDevelopmentPath: string;
  workspaceDir: string;
  timeout?: number;
  ipcPort?: number;
}

/**
 * Тест-кейс для IsolatedRunner
 */
interface RunnerTestCase {
  toolPath: string;
  toolName: string;
  params?: Record<string, unknown>;
  expected?: ExpectedResult;
}

/**
 * Результат выполнения теста от IsolatedRunner
 */
interface RunnerTestResult {
  success: boolean;
  output?: unknown;
  error?: string;
  duration: number;
}

/**
 * Интерфейс IsolatedRunner (динамический импорт)
 */
interface IsolatedRunner {
  start(): Promise<void>;
  stop(): Promise<void>;
  runTest(testCase: RunnerTestCase, context?: { mode?: string }): Promise<RunnerTestResult>;
  isRunning(): boolean;
}

/**
 * Валидатор результатов тестов
 */
export class ResultValidator {
  /**
   * Валидировать результат теста
   */
  validate(output: unknown, expected: ExpectedResult | undefined, workspaceDir: string): ValidationResult {
    if (!expected) {
      return { passed: true };
    }

    // Проверяем contains
    if (expected.contains !== undefined) {
      const result = this.validateContains(output, expected.contains);
      if (!result.passed) {
        return result;
      }
    }

    // Проверяем endsWith
    if (expected.endsWith !== undefined) {
      const result = this.validateEndsWith(output, expected.endsWith);
      if (!result.passed) {
        return result;
      }
    }

    // Проверяем matches (regex)
    if (expected.matches !== undefined) {
      const result = this.validateMatches(output, expected.matches);
      if (!result.passed) {
        return result;
      }
    }

    // Проверяем equals
    if (expected.equals !== undefined) {
      const result = this.validateEquals(output, expected.equals);
      if (!result.passed) {
        return result;
      }
    }

    // Проверяем jsonSchema (опционально)
    if (expected.jsonSchema !== undefined) {
      const result = this.validateJsonSchema(output, expected.jsonSchema);
      if (!result.passed) {
        return result;
      }
    }

    // Проверяем fileExists
    if (expected.fileExists !== undefined) {
      const result = this.validateFileExists(expected.fileExists, workspaceDir);
      if (!result.passed) {
        return result;
      }
    }

    // Проверяем fileNotExists
    if (expected.fileNotExists !== undefined) {
      const result = this.validateFileNotExists(expected.fileNotExists, workspaceDir);
      if (!result.passed) {
        return result;
      }
    }

    return { passed: true };
  }

  /**
   * Проверка contains
   */
  private validateContains(output: unknown, expected: string): ValidationResult {
    const outputStr = String(output);
    if (!outputStr.includes(expected)) {
      return {
        passed: false,
        matcher: 'contains',
        expected,
        actual: outputStr.substring(0, 200),
        error: `Output does not contain "${expected}"`,
      };
    }
    return { passed: true, matcher: 'contains', expected };
  }

  /**
   * Проверка endsWith
   */
  private validateEndsWith(output: unknown, expected: string): ValidationResult {
    const outputStr = String(output);
    if (!outputStr.endsWith(expected)) {
      return {
        passed: false,
        matcher: 'endsWith',
        expected,
        actual: outputStr.substring(0, 200),
        error: `Output does not end with "${expected}"`,
      };
    }
    return { passed: true, matcher: 'endsWith', expected };
  }

  /**
   * Проверка matches (regex)
   */
  private validateMatches(output: unknown, pattern: string): ValidationResult {
    const outputStr = String(output);
    const regex = new RegExp(pattern);
    if (!regex.test(outputStr)) {
      return {
        passed: false,
        matcher: 'matches',
        expected: pattern,
        actual: outputStr.substring(0, 200),
        error: `Output does not match pattern "${pattern}"`,
      };
    }
    return { passed: true, matcher: 'matches', expected: pattern };
  }

  /**
   * Проверка equals
   */
  private validateEquals(output: unknown, expected: unknown): ValidationResult {
    const outputStr = String(output);
    const expectedStr = String(expected);
    if (outputStr !== expectedStr) {
      return {
        passed: false,
        matcher: 'equals',
        expected: expectedStr,
        actual: outputStr.substring(0, 200),
        error: `Output does not equal expected value`,
      };
    }
    return { passed: true, matcher: 'equals', expected };
  }

  /**
   * Проверка JSON Schema (упрощённая)
   */
  private validateJsonSchema(output: unknown, schema: object): ValidationResult {
    // Упрощённая валидация - просто проверяем что это валидный JSON
    try {
      JSON.stringify(output);
      return { passed: true, matcher: 'jsonSchema' };
    } catch {
      return {
        passed: false,
        matcher: 'jsonSchema',
        error: 'Output is not valid JSON',
      };
    }
  }

  /**
   * Проверяет существование файлов
   * @param paths - путь или массив путей (относительно workspaceDir)
   * @param workspaceDir - корневая директория workspace
   */
  validateFileExists(paths: string | string[], workspaceDir: string): ValidationResult {
    const pathList = Array.isArray(paths) ? paths : [paths];
    
    for (const relativePath of pathList) {
      const fullPath = path.join(workspaceDir, relativePath);
      if (!fs.existsSync(fullPath)) {
        return {
          passed: false,
          matcher: 'fileExists',
          expected: relativePath,
          error: `File should exist but not found: ${relativePath}`,
        };
      }
    }
    
    return { passed: true, matcher: 'fileExists', expected: paths };
  }

  /**
   * Проверяет отсутствие файлов
   * @param paths - путь или массив путей (относительно workspaceDir)
   * @param workspaceDir - корневая директория workspace
   */
  validateFileNotExists(paths: string | string[], workspaceDir: string): ValidationResult {
    const pathList = Array.isArray(paths) ? paths : [paths];
    
    for (const relativePath of pathList) {
      const fullPath = path.join(workspaceDir, relativePath);
      if (fs.existsSync(fullPath)) {
        return {
          passed: false,
          matcher: 'fileNotExists',
          expected: relativePath,
          error: `File should not exist but found: ${relativePath}`,
        };
      }
    }
    
    return { passed: true, matcher: 'fileNotExists', expected: paths };
  }
}

/**
 * Главный класс для запуска тестов
 */
export class TestRunner {
  private config: TestRunnerConfig;
  private loader: TestCaseLoader;
  private consoleReporter: ConsoleReporter;
  private validator: ResultValidator;
  private isolatedRunner: IsolatedRunner | null = null;
  private sandbox: SandboxManager | null = null;
  private sandboxWorkspaceDir: string = '';

  constructor(config: TestRunnerConfig) {
    this.config = {
      timeout: 30000,
      parallel: 1,
      verbose: false,
      ...config,
    };

    this.loader = new TestCaseLoader(config.workspaceDir);
    this.consoleReporter = new ConsoleReporter(config.verbose);
    this.validator = new ResultValidator();
  }

  /**
   * Запустить все тесты
   */
  async runAll(): Promise<TestReport> {
    const startTime = Date.now();
    const results: TestExecutionResult[] = [];

    // Загружаем тест-кейсы
    this.consoleReporter.printLoading(this.config.testCasesDir);
    const loadResult = await this.loader.loadFromDirectory(this.config.testCasesDir);

    // Выводим ошибки загрузки
    for (const error of loadResult.errors) {
      this.consoleReporter.printError(error.message);
    }

    if (loadResult.testCases.length === 0) {
      this.consoleReporter.printError('No test cases found');
      return this.createReport([], startTime);
    }

    this.consoleReporter.printStart(loadResult.testCases.length);

    // Инициализируем runner
    await this.initializeRunner();

    try {
      // Выполняем тесты
      if (this.config.parallel && this.config.parallel > 1) {
        // Параллельный запуск
        const batches = this.createBatches(loadResult.testCases, this.config.parallel);
        for (const batch of batches) {
          const batchResults = await this.runBatch(batch);
          results.push(...batchResults);
        }
      } else {
        // Последовательный запуск
        for (const testCase of loadResult.testCases) {
          const result = await this.runSingle(testCase);
          results.push(result);
        }
      }
    } finally {
      // Останавливаем runner
      await this.shutdownRunner();
    }

    return this.createReport(results, startTime);
  }

  /**
   * Запустить конкретный файл с тестами
   */
  async runFile(filePath: string): Promise<TestReport> {
    const startTime = Date.now();
    const results: TestExecutionResult[] = [];

    this.consoleReporter.printLoading(filePath);
    const loadResult = await this.loader.loadFromFile(filePath);

    if (loadResult.error) {
      this.consoleReporter.printError(loadResult.error.message);
      return this.createReport([], startTime);
    }

    if (!loadResult.testCases || loadResult.testCases.length === 0) {
      this.consoleReporter.printError('No test cases found in file');
      return this.createReport([], startTime);
    }

    this.consoleReporter.printStart(loadResult.testCases.length);

    // Инициализируем runner
    await this.initializeRunner();

    try {
      for (const testCase of loadResult.testCases) {
        const result = await this.runSingle(testCase);
        results.push(result);
      }
    } finally {
      await this.shutdownRunner();
    }

    return this.createReport(results, startTime);
  }

  /**
   * Инициализировать IsolatedRunner и SandboxManager
   */
  private async initializeRunner(): Promise<void> {
    // Инициализируем sandbox для изоляции файловой системы
    this.sandbox = createSandboxManager({
      originalWorkspace: this.config.workspaceDir,
    });
    this.sandboxWorkspaceDir = await this.sandbox.initialize();
    console.log(`[TestRunner] Sandbox workspace: ${this.sandboxWorkspaceDir}`);

    // Динамический импорт runner
    const runnerPath = path.join(this.config.extensionDevelopmentPath, '..', 'runner', 'dist', 'index.js');
    const { IsolatedRunner } = await import(runnerPath);

    const runnerConfig: IsolatedRunnerConfig = {
      userDataDir: this.config.userDataDir,
      extensionDevelopmentPath: this.config.extensionDevelopmentPath,
      workspaceDir: this.sandboxWorkspaceDir, // Используем sandbox директорию
      timeout: this.config.timeout,
    };

    const runner = new IsolatedRunner(runnerConfig);
    await runner.start();
    this.isolatedRunner = runner;
  }

  /**
   * Остановить IsolatedRunner и очистить SandboxManager
   */
  private async shutdownRunner(): Promise<void> {
    if (this.isolatedRunner) {
      await this.isolatedRunner.stop();
      this.isolatedRunner = null;
    }
    if (this.sandbox) {
      await this.sandbox.cleanup();
      this.sandbox = null;
    }
  }

  /**
   * Выполнить один тест
   */
  private async runSingle(testCase: ResolvedTestCase): Promise<TestExecutionResult> {
    const startTime = Date.now();

    if (!this.isolatedRunner) {
      return this.createErrorResult(testCase, 'Runner not initialized', startTime);
    }

    try {
      // Преобразуем в формат для IsolatedRunner
      const runnerTestCase: RunnerTestCase = {
        toolPath: testCase.resolvedToolPath,
        toolName: testCase.definition.toolName,
        params: testCase.definition.params,
        expected: testCase.definition.expected,
      };

      // Выполняем тест
      const result = await this.isolatedRunner.runTest(runnerTestCase, {
        mode: testCase.definition.context?.mode || 'code',
      });

      // Валидируем результат (используем sandbox директорию для проверки файлов)
      const validation = this.validator.validate(
        result.output,
        testCase.definition.expected,
        this.sandboxWorkspaceDir || this.config.workspaceDir
      );

      const testResult: TestExecutionResult = {
        testId: testCase.definition.id,
        description: testCase.definition.description,
        suiteName: testCase.suiteName,
        toolName: testCase.definition.toolName,
        params: testCase.definition.params,
        success: result.success && validation.passed,
        output: result.output,
        error: result.error || validation.error,
        duration: result.duration,
        validation,
        timestamp: new Date().toISOString(),
      };

      // Сбрасываем sandbox ПОСЛЕ теста для восстановления состояния перед следующим тестом
      if (this.sandbox) {
        await this.sandbox.reset();
      }

      return testResult;
    } catch (error) {
      // Даже при ошибке сбрасываем sandbox
      if (this.sandbox) {
        await this.sandbox.reset();
      }
      
      return this.createErrorResult(
        testCase,
        error instanceof Error ? error.message : String(error),
        startTime
      );
    }
  }

  /**
   * Выполнить пакет тестов параллельно
   */
  private async runBatch(testCases: ResolvedTestCase[]): Promise<TestExecutionResult[]> {
    const promises = testCases.map(tc => this.runSingle(tc));
    return Promise.all(promises);
  }

  /**
   * Разбить тест-кейсы на пакеты для параллельного выполнения
   */
  private createBatches(testCases: ResolvedTestCase[], parallelCount: number): ResolvedTestCase[][] {
    const batches: ResolvedTestCase[][] = [];
    const batchSize = Math.ceil(testCases.length / parallelCount);

    for (let i = 0; i < testCases.length; i += batchSize) {
      batches.push(testCases.slice(i, i + batchSize));
    }

    return batches;
  }

  /**
   * Создать результат с ошибкой
   */
  private createErrorResult(
    testCase: ResolvedTestCase,
    error: string,
    startTime: number
  ): TestExecutionResult {
    return {
      testId: testCase.definition.id,
      description: testCase.definition.description,
      suiteName: testCase.suiteName,
      toolName: testCase.definition.toolName,
      params: testCase.definition.params,
      success: false,
      error,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Создать отчёт
   */
  private createReport(results: TestExecutionResult[], startTime: number): TestReport {
    return {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      skipped: 0,
      duration: Date.now() - startTime,
      results,
    };
  }

  /**
   * Вывести отчёт
   */
  printReport(report: TestReport): void {
    this.consoleReporter.print(report);
  }

  /**
   * Сохранить отчёт в JUnit формате
   */
  saveJUnitReport(report: TestReport, filePath: string): void {
    const junitReporter = new JUnitReporter();
    junitReporter.save(report, filePath);
    console.log(`JUnit report saved to: ${filePath}`);
  }
}

/**
 * Создать TestRunner с настройками по умолчанию
 */
export function createTestRunner(config: TestRunnerConfig): TestRunner {
  return new TestRunner(config);
}

/**
 * Получить путь к временной директории для VSCode user data
 */
export function getDefaultUserDataDir(): string {
  return path.join(os.tmpdir(), 'roocode-test-vscode-data');
}
