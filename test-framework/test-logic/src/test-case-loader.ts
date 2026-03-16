/**
 * Загрузчик тест-кейсов из YAML файлов
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import {
  TestCaseFile,
  TestCaseDefinition,
  ResolvedTestCase,
} from './types.js';

/**
 * Ошибка загрузки тест-кейса
 */
export class TestCaseLoadError extends Error {
  constructor(
    public filePath: string,
    public reason: string,
    public details?: unknown
  ) {
    super(`Failed to load test case from ${filePath}: ${reason}`);
    this.name = 'TestCaseLoadError';
  }
}

/**
 * Результат загрузки тест-кейсов
 */
export interface LoadResult {
  /** Загруженные тест-кейсы */
  testCases: ResolvedTestCase[];
  /** Ошибки загрузки */
  errors: TestCaseLoadError[];
}

/**
 * Загрузчик тест-кейсов из YAML файлов
 */
export class TestCaseLoader {
  private workspaceDir: string;

  constructor(workspaceDir: string) {
    this.workspaceDir = workspaceDir;
  }

  /**
   * Загрузить все тест-кейсы из директории
   */
  async loadFromDirectory(dir: string): Promise<LoadResult> {
    const absoluteDir = path.resolve(this.workspaceDir, dir);
    const testCases: ResolvedTestCase[] = [];
    const errors: TestCaseLoadError[] = [];

    // Проверяем существование директории
    if (!fs.existsSync(absoluteDir)) {
      errors.push(new TestCaseLoadError(absoluteDir, 'Directory does not exist'));
      return { testCases, errors };
    }

    // Читаем файлы в директории
    const files = this.findYamlFiles(absoluteDir);

    for (const file of files) {
      const result = await this.loadFromFile(file);
      if (result.testCases) {
        testCases.push(...result.testCases);
      }
      if (result.error) {
        errors.push(result.error);
      }
    }

    return { testCases, errors };
  }

  /**
   * Загрузить тест-кейсы из конкретного файла
   */
  async loadFromFile(filePath: string): Promise<{
    testCases?: ResolvedTestCase[];
    error?: TestCaseLoadError;
  }> {
    const absolutePath = path.resolve(this.workspaceDir, filePath);

    // Проверяем существование файла
    if (!fs.existsSync(absolutePath)) {
      return {
        error: new TestCaseLoadError(absolutePath, 'File does not exist'),
      };
    }

    // Читаем и парсим YAML
    let content: string;
    try {
      content = fs.readFileSync(absolutePath, 'utf-8');
    } catch (err) {
      return {
        error: new TestCaseLoadError(absolutePath, 'Failed to read file', err),
      };
    }

    let data: unknown;
    try {
      data = yaml.load(content);
    } catch (err) {
      return {
        error: new TestCaseLoadError(absolutePath, 'Failed to parse YAML', err),
      };
    }

    // Валидируем структуру
    const validationResult = this.validateTestCaseFile(data);
    if (!validationResult.valid) {
      return {
        error: new TestCaseLoadError(absolutePath, validationResult.reason!),
      };
    }

    const testCaseFile = data as TestCaseFile;

    // Разрешаем пути и создаём ResolvedTestCase
    const resolvedTestCases: ResolvedTestCase[] = testCaseFile.testCases.map(
      (tc) => this.resolveTestCase(tc, testCaseFile.name, absolutePath)
    );

    return { testCases: resolvedTestCases };
  }

  /**
   * Найти все YAML файлы в директории (рекурсивно)
   */
  private findYamlFiles(dir: string): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...this.findYamlFiles(fullPath));
      } else if (entry.isFile() && this.isYamlFile(entry.name)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Проверить, является ли файл YAML
   */
  private isYamlFile(filename: string): boolean {
    return filename.endsWith('.yaml') || filename.endsWith('.yml');
  }

  /**
   * Валидировать структуру тест-кейса
   */
  private validateTestCaseFile(data: unknown): { valid: boolean; reason?: string } {
    if (!data || typeof data !== 'object') {
      return { valid: false, reason: 'Test case file must be an object' };
    }

    const obj = data as Record<string, unknown>;

    // Проверяем обязательные поля
    if (typeof obj.name !== 'string' || !obj.name) {
      return { valid: false, reason: 'Missing required field: name' };
    }

    if (!Array.isArray(obj.testCases)) {
      return { valid: false, reason: 'Missing required field: testCases (array)' };
    }

    // Валидируем каждый тест-кейс
    for (let i = 0; i < obj.testCases.length; i++) {
      const tc = obj.testCases[i];
      const tcValidation = this.validateTestCaseDefinition(tc, i);
      if (!tcValidation.valid) {
        return tcValidation;
      }
    }

    return { valid: true };
  }

  /**
   * Валидировать определение тест-кейса
   */
  private validateTestCaseDefinition(
    tc: unknown,
    index: number
  ): { valid: boolean; reason?: string } {
    if (!tc || typeof tc !== 'object') {
      return { valid: false, reason: `Test case ${index} must be an object` };
    }

    const obj = tc as Record<string, unknown>;

    if (typeof obj.id !== 'string' || !obj.id) {
      return { valid: false, reason: `Test case ${index}: missing required field 'id'` };
    }

    if (typeof obj.toolPath !== 'string' || !obj.toolPath) {
      return { valid: false, reason: `Test case ${index} (${obj.id}): missing required field 'toolPath'` };
    }

    if (typeof obj.toolName !== 'string' || !obj.toolName) {
      return { valid: false, reason: `Test case ${index} (${obj.id}): missing required field 'toolName'` };
    }

    return { valid: true };
  }

  /**
   * Разрешить пути в тест-кейсе
   */
  private resolveTestCase(
    definition: TestCaseDefinition,
    suiteName: string,
    sourceFile: string
  ): ResolvedTestCase {
    // Разрешаем путь к tool относительно workspace
    const resolvedToolPath = path.resolve(this.workspaceDir, definition.toolPath);

    return {
      definition,
      suiteName,
      resolvedToolPath,
      sourceFile,
    };
  }
}

/**
 * Создать загрузчик тест-кейсов
 */
export function createTestCaseLoader(workspaceDir: string): TestCaseLoader {
  return new TestCaseLoader(workspaceDir);
}
