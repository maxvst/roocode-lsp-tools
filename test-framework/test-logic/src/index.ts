/**
 * Test Logic Layer - точка входа
 * 
 * CLI для запуска тестов и API для программного использования
 */

import * as path from 'path';
import * as os from 'os';
import { fileURLToPath } from 'url';

// ESM-совместимый аналог __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { TestRunner, createTestRunner, getDefaultUserDataDir } from './test-runner.js';
import { TestCaseLoader, createTestCaseLoader } from './test-case-loader.js';
import { ConsoleReporter, JUnitReporter, createReporter } from './reporter.js';
import {
  CLIOptions,
  TestReport,
  TestRunnerConfig,
  TestCaseFile,
  TestCaseDefinition,
  TestExecutionResult,
} from './types.js';

// Экспорт типов
export type {
  CLIOptions,
  TestReport,
  TestRunnerConfig,
  TestCaseFile,
  TestCaseDefinition,
  TestExecutionResult,
  ExpectedResult,
  ValidationResult,
  ResolvedTestCase,
} from './types.js';

// Экспорт классов
export { TestRunner, createTestRunner, getDefaultUserDataDir } from './test-runner.js';
export { TestCaseLoader, createTestCaseLoader, TestCaseLoadError } from './test-case-loader.js';
export { ConsoleReporter, JUnitReporter, createReporter } from './reporter.js';
export { ResultValidator } from './test-runner.js';

/**
 * Парсинг аргументов командной строки
 */
function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--file':
      case '-f':
        options.file = args[++i];
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--timeout':
      case '-t':
        options.timeout = parseInt(args[++i], 10);
        break;
      case '--parallel':
      case '-p':
        options.parallel = parseInt(args[++i], 10);
        break;
      case '--reporter':
      case '-r':
        options.reporter = args[++i] as 'console' | 'junit';
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--workspace':
      case '-w':
        options.workspace = args[++i];
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

/**
 * Вывод справки
 */
function printHelp(): void {
  console.log(`
Usage: node cli.js test [options]

Options:
  --file, -f <path>       Path to specific test file or directory
  --verbose, -v           Enable verbose output
  --timeout, -t <ms>      Test timeout in milliseconds (default: 30000)
  --parallel, -p <n>      Number of parallel test runners (default: 1)
  --reporter, -r <type>   Reporter type: console (default) or junit
  --output, -o <path>     Output file path for JUnit reporter
  --workspace, -w <path>  Workspace directory (default: current directory)
  --help, -h              Show this help message

Examples:
  # Run all tests
  node cli.js test

  # Run specific test file
  node cli.js test --file test-cases/test-tomorrow.yaml

  # Run with verbose output
  node cli.js test --verbose

  # Generate JUnit report
  node cli.js test --reporter junit --output results.xml
`);
}

/**
 * Запуск тестов из CLI
 */
export async function runCLI(args: string[]): Promise<number> {
  const options = parseArgs(args);

  // Определяем пути к компонентам
  const frameworkDir = path.dirname(path.dirname(__dirname));
  
  // Определяем workspace (по умолчанию - test-workspace)
  const workspaceDir = options.workspace || path.join(frameworkDir, 'test-workspace');

  // Определяем путь к тестам
  const testCasesDir = options.file
    ? path.resolve(frameworkDir, options.file)
    : path.join(frameworkDir, 'test-cases');

  const extensionDevelopmentPath = path.join(frameworkDir, 'toolstarter');
  const userDataDir = path.join(os.tmpdir(), 'roocode-test-vscode-data');

  // Создаём конфигурацию
  const config: TestRunnerConfig = {
    testCasesDir,
    userDataDir,
    extensionDevelopmentPath,
    workspaceDir,
    timeout: options.timeout || 30000,
    parallel: options.parallel || 1,
    verbose: options.verbose || false,
  };

  // Создаём runner
  const runner = createTestRunner(config);

  try {
    // Запускаем тесты
    let report: TestReport;

    if (options.file && !options.file.endsWith('.yaml') && !options.file.endsWith('.yml')) {
      // Если указана директория
      report = await runner.runAll();
    } else if (options.file) {
      // Если указан конкретный файл
      report = await runner.runFile(options.file);
    } else {
      // Запуск всех тестов
      report = await runner.runAll();
    }

    // Выводим отчёт
    runner.printReport(report);

    // Сохраняем JUnit отчёт если нужно
    if (options.reporter === 'junit' && options.output) {
      runner.saveJUnitReport(report, options.output);
    }

    // Возвращаем exit code
    return report.failed > 0 ? 1 : 0;
  } catch (error) {
    console.error('Failed to run tests:', error);
    return 1;
  }
}

/**
 * Главная функция CLI
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printHelp();
    process.exit(0);
  }

  // Первые аргумент - команда
  const command = args[0];
  const commandArgs = args.slice(1);

  if (command === 'test') {
    const exitCode = await runCLI(commandArgs);
    process.exit(exitCode);
  } else {
    console.error(`Unknown command: ${command}`);
    console.error('Use "test" command to run tests');
    process.exit(1);
  }
}

// Запускаем main если это главный модуль
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default { runCLI };
