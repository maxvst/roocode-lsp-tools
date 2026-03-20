/**
 * Reporter - форматирование отчётов о выполнении тестов
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  TestReport,
  TestExecutionResult,
  ValidationResult,
} from './types.js';

// === ANSI Colors (без внешних зависимостей) ===

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

/**
 * Проверить, поддерживает ли терминал цвета
 */
function supportsColor(): boolean {
  return process.env.FORCE_COLOR === '1' || (
    process.stdout.isTTY && process.env.TERM !== 'dumb'
  );
}

/**
 * Применить цвет к тексту
 */
function colorize(text: string, color: keyof typeof ANSI): string {
  if (!supportsColor()) {
    return text;
  }
  return `${ANSI[color]}${text}${ANSI.reset}`;
}

// === Console Reporter ===

/**
 * Консольный репортер с цветным выводом
 */
export class ConsoleReporter {
  private verbose: boolean;

  constructor(verbose = false) {
    this.verbose = verbose;
  }

  /**
   * Вывести отчёт в консоль
   */
  print(report: TestReport): void {
    console.log();
    console.log(colorize('═'.repeat(60), 'cyan'));
    console.log(colorize('  Test Results', 'bold'));
    console.log(colorize('═'.repeat(60), 'cyan'));
    console.log();

    // Выводим результаты каждого теста
    for (const result of report.results) {
      this.printTestResult(result);
    }

    // Выводим итоговую статистику
    this.printSummary(report);

    console.log();
  }

  /**
   * Вывести результат отдельного теста
   */
  private printTestResult(result: TestExecutionResult): void {
    if (result.success) {
      // Краткий вывод для успешных тестов
      const status = colorize('✓', 'green');
      const duration = colorize(`(${result.duration}ms)`, 'dim');
      console.log(`${status} ${result.testId} ${duration}`);
      
      // В verbose режиме выводим детали даже для успешных
      if (this.verbose) {
        this.printDetails(result);
      }
    } else {
      // Детализированный вывод для failed тестов
      this.printFailedTest(result);
    }
  }

  /**
   * Вывести детализированную информацию для failed теста
   */
  private printFailedTest(result: TestExecutionResult): void {
    console.log();
    console.log(colorize('❌ FAILED: ', 'red') + colorize(result.testId, 'bold'));
    console.log(colorize('─'.repeat(50), 'dim'));
    
    // Description
    if (result.description) {
      console.log(colorize('   Description: ', 'cyan') + result.description);
    }
    
    // Tool name
    if (result.toolName) {
      console.log(colorize('   Tool: ', 'cyan') + colorize(result.toolName, 'yellow'));
    }
    
    // Parameters
    if (result.params && Object.keys(result.params).length > 0) {
      console.log(colorize('   Parameters:', 'cyan'));
      for (const [key, value] of Object.entries(result.params)) {
        const formattedValue = this.formatParameterValue(value);
        console.log(colorize(`     - ${key}: `, 'dim') + formattedValue);
      }
    }
    
    // Expected vs Actual (из validation)
    if (result.validation) {
      this.printValidationDetails(result.validation);
    }
    
    // Error message
    if (result.error) {
      console.log(colorize('   Error: ', 'red') + colorize(result.error, 'red'));
    }
    
    // Output (фактический результат)
    if (result.output !== undefined) {
      console.log(colorize('   Output:', 'cyan'));
      const outputStr = this.formatOutputMultiline(result.output);
      console.log(colorize(outputStr, 'dim'));
    }
    
    // Duration
    console.log(colorize(`   Duration: `, 'dim') + colorize(`${result.duration}ms`, 'dim'));
    console.log();
  }

  /**
   * Вывести детали валидации (expected vs actual)
   */
  private printValidationDetails(validation: ValidationResult): void {
    if (validation.matcher) {
      console.log(colorize('   Matcher: ', 'cyan') + validation.matcher);
    }
    
    if (validation.expected !== undefined) {
      const expectedStr = this.formatParameterValue(validation.expected);
      console.log(colorize('   Expected: ', 'green') + expectedStr);
    }
    
    if (validation.actual !== undefined) {
      const actualStr = this.formatParameterValue(validation.actual);
      console.log(colorize('   Actual: ', 'red') + actualStr);
    }
  }

  /**
   * Форматировать значение параметра для вывода
   */
  private formatParameterValue(value: unknown): string {
    if (value === null) {
      return colorize('null', 'dim');
    }
    if (value === undefined) {
      return colorize('undefined', 'dim');
    }
    if (typeof value === 'string') {
      // Обрезаем длинные строки
      if (value.length > 80) {
        return `"${value.substring(0, 77)}..."`;
      }
      return `"${value}"`;
    }
    if (typeof value === 'object') {
      try {
        const json = JSON.stringify(value, null, 2);
        // Обрезаем длинный JSON
        if (json.length > 200) {
          return json.substring(0, 197) + '...';
        }
        return json;
      } catch {
        return String(value);
      }
    }
    return String(value);
  }

  /**
   * Форматировать output в многострочном виде
   */
  private formatOutputMultiline(output: unknown): string {
    if (typeof output === 'string') {
      // Обрезаем очень длинные строки
      if (output.length > 500) {
        return output.substring(0, 497) + '...';
      }
      return output;
    }
    try {
      return JSON.stringify(output, null, 2);
    } catch {
      return String(output);
    }
  }

  /**
   * Вывести детали теста (verbose mode)
   */
  private printDetails(result: TestExecutionResult): void {
    // Выводим результат
    if (result.output !== undefined) {
      const output = this.formatOutput(result.output);
      console.log(colorize(`  Result: ${output}`, 'dim'));
    }

    // Выводим результат валидации
    if (result.validation) {
      this.printValidation(result.validation);
    }
  }

  /**
   * Вывести результат валидации
   */
  private printValidation(validation: ValidationResult): void {
    const status = validation.passed
      ? colorize('✓', 'green')
      : colorize('✗', 'red');

    let message = '';
    if (validation.matcher) {
      message = `Validation: ${validation.matcher}`;
      if (validation.expected !== undefined) {
        message += ` "${this.formatOutput(validation.expected)}"`;
      }
    }

    if (message) {
      console.log(colorize(`  ${status} ${message}`, 'dim'));
    }
  }

  /**
   * Форматировать вывод для отображения
   */
  private formatOutput(output: unknown): string {
    if (typeof output === 'string') {
      // Обрезаем длинные строки
      if (output.length > 100) {
        return output.substring(0, 97) + '...';
      }
      return output;
    }
    return JSON.stringify(output);
  }

  /**
   * Вывести итоговую статистику
   */
  private printSummary(report: TestReport): void {
    console.log(colorize('─'.repeat(60), 'cyan'));

    const passed = colorize(`${report.passed} passed`, 'green');
    const failed = report.failed > 0
      ? colorize(`${report.failed} failed`, 'red')
      : `${report.failed} failed`;
    const duration = colorize(`(${report.duration}ms total)`, 'dim');

    console.log();
    console.log(`Summary: ${passed}, ${failed} ${duration}`);

    // Общий статус
    if (report.failed === 0) {
      console.log(colorize('All tests passed! ✓', 'green'));
    } else {
      console.log(colorize('Some tests failed. ✗', 'red'));
    }
  }

  /**
   * Вывести сообщение о начале выполнения
   */
  printStart(testCount: number): void {
    console.log();
    console.log(colorize(`Running ${testCount} test(s)...`, 'cyan'));
    console.log();
  }

  /**
   * Вывести сообщение о загрузке тест-кейса
   */
  printLoading(filePath: string): void {
    console.log(colorize(`Loading: ${filePath}`, 'dim'));
  }

  /**
   * Вывести ошибку
   */
  printError(message: string, error?: Error): void {
    console.error(colorize(`Error: ${message}`, 'red'));
    if (error && this.verbose) {
      console.error(colorize(error.stack || error.message, 'dim'));
    }
  }
}

// === JUnit XML Reporter ===

/**
 * JUnit XML репортер для CI/CD интеграции
 */
export class JUnitReporter {
  /**
   * Сгенерировать JUnit XML отчёт
   */
  generate(report: TestReport): string {
    const lines: string[] = [];

    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<testsuites>');

    // Группируем по suite
    const suites = this.groupBySuite(report.results);

    for (const [suiteName, results] of suites) {
      const suiteFailed = results.filter(r => !r.success).length;
      const suiteDuration = results.reduce((sum, r) => sum + r.duration, 0);

      lines.push(`  <testsuite name="${this.escapeXml(suiteName)}" tests="${results.length}" failures="${suiteFailed}" time="${suiteDuration / 1000}">`);

      for (const result of results) {
        lines.push(this.generateTestCase(result));
      }

      lines.push('  </testsuite>');
    }

    lines.push('</testsuites>');

    return lines.join('\n');
  }

  /**
   * Сгенерировать XML для отдельного тест-кейса
   */
  private generateTestCase(result: TestExecutionResult): string {
    const lines: string[] = [];
    const attrs = [
      `name="${this.escapeXml(result.testId)}"`,
      `time="${result.duration / 1000}"`,
    ].join(' ');

    lines.push(`    <testcase ${attrs}>`);

    if (!result.success) {
      const failureAttrs = [
        `message="${this.escapeXml(result.error || 'Test failed')}"`,
      ].join(' ');
      lines.push(`      <failure ${failureAttrs}>`);
      if (result.output !== undefined) {
        lines.push(`        Output: ${this.escapeXml(String(result.output))}`);
      }
      lines.push(`      </failure>`);
    }

    // System out для вывода теста
    if (result.output !== undefined) {
      lines.push(`      <system-out>${this.escapeXml(String(result.output))}</system-out>`);
    }

    lines.push('    </testcase>');

    return lines.join('\n');
  }

  /**
   * Сгруппировать результаты по suite
   */
  private groupBySuite(results: TestExecutionResult[]): Map<string, TestExecutionResult[]> {
    const suites = new Map<string, TestExecutionResult[]>();

    for (const result of results) {
      const suite = result.suiteName || 'default';
      if (!suites.has(suite)) {
        suites.set(suite, []);
      }
      suites.get(suite)!.push(result);
    }

    return suites;
  }

  /**
   * Экранировать XML спецсимволы
   */
  private escapeXml(text: string): string {
    const AMP = '\x26' + 'amp;';   // &
    const LT = '\x26' + 'lt;';     // <
    const GT = '\x26' + 'gt;';     // >
    const QUOT = '\x26' + 'quot;'; // "
    const APOS = '\x26' + 'apos;'; // '
    
    return text
      .replace(/&/g, AMP)
      .replace(/</g, LT)
      .replace(/>/g, GT)
      .replace(/"/g, QUOT)
      .replace(/'/g, APOS);
  }

  /**
   * Сохранить отчёт в файл
   */
  save(report: TestReport, filePath: string): void {
    const xml = this.generate(report);
    const dir = path.dirname(filePath);

    // Создаём директорию, если не существует
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, xml, 'utf-8');
  }
}

// === Factory ===

/**
 * Создать репортер по типу
 */
export function createReporter(type: 'console' | 'junit', verbose = false): ConsoleReporter | JUnitReporter {
  switch (type) {
    case 'console':
      return new ConsoleReporter(verbose);
    case 'junit':
      return new JUnitReporter();
    default:
      throw new Error(`Unknown reporter type: ${type}`);
  }
}
