#!/usr/bin/env node
/**
 * CLI точка входа для тестового фреймворка
 * 
 * Usage:
 *   node cli.js test                    # Запуск всех тестов
 *   node cli.js test --file test.yaml   # Запуск конкретного файла
 *   node cli.js test --verbose          # Детальный вывод
 */

import { runCLI } from './test-logic/dist/index.js';

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exit(0);
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  switch (command) {
    case 'test':
      const exitCode = await runCLI(commandArgs);
      process.exit(exitCode);
      break;

    case 'help':
    case '--help':
    case '-h':
      printUsage();
      process.exit(0);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

function printUsage(): void {
  console.log(`
RooCode LSP Tools Test Framework

Usage:
  node cli.js <command> [options]

Commands:
  test     Run tests
  help     Show this help message

Test Options:
  --file, -f <path>       Path to test file or directory
  --verbose, -v           Enable verbose output
  --timeout, -t <ms>      Test timeout (default: 30000)
  --parallel, -p <n>      Number of parallel runners (default: 1)
  --reporter, -r <type>   Reporter: console (default) or junit
  --output, -o <path>     Output file for JUnit reporter
  --workspace, -w <path>  Workspace directory

Examples:
  node cli.js test
  node cli.js test --file test-cases/test-tomorrow.yaml
  node cli.js test --verbose --timeout 60000
  node cli.js test --reporter junit --output results.xml
`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
