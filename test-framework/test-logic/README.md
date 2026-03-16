# Test Logic Layer

Компонент Test Logic Layer для тестового фреймворка RooCode Custom Tools.

## Назначение

- Загрузка тест-кейсов из YAML файлов
- Управление запуском тестов через IsolatedRunner
- Валидация результатов выполнения
- Форматирование отчётов (console, JUnit XML)

## Структура

```
test-logic/
├── src/
│   ├── index.ts           # Точка входа CLI и API
│   ├── test-runner.ts     # Главный класс для запуска тестов
│   ├── test-case-loader.ts # Загрузка тест-кейсов из YAML
│   ├── reporter.ts        # Форматирование отчётов
│   └── types.ts           # Типы и интерфейсы
├── package.json
├── tsconfig.json
└── README.md
```

## Использование

### CLI

```bash
# Запуск всех тестов
node cli.js test

# Запуск конкретного файла
node cli.js test --file test-cases/test-tomorrow.yaml

# Детальный вывод
node cli.js test --verbose

# С таймаутом
node cli.js test --timeout 60000

# JUnit отчёт
node cli.js test --reporter junit --output results.xml
```

### Программный API

```typescript
import { TestRunner, createTestRunner } from '@roocode-lsp-tools/test-logic';

const runner = createTestRunner({
  testCasesDir: './test-cases',
  userDataDir: '/tmp/test-vscode-data',
  extensionDevelopmentPath: '../toolstarter',
  workspaceDir: process.cwd(),
  verbose: true,
});

const report = await runner.runAll();
runner.printReport(report);

if (report.failed > 0) {
  process.exit(1);
}
```

## Формат тест-кейсов

```yaml
name: "Test Suite Name"
description: "Описание набора тестов"

testCases:
  - id: "test-id"
    description: "Описание теста"
    toolPath: "../src/test.ts"  # Путь к tool относительно workspace
    toolName: "tommorow"
    params: {}
    context:
      mode: "code"
    expected:
      contains: "хорошо"  # Результат должен содержать строку
      # или
      # matches: ".*regex.*"  # Regex паттерн
      # equals: "точное совпадение"
    timeout: 30000
```

## Валидация результатов

Поддерживаемые матчеры:

- `contains` - проверка наличия подстроки
- `matches` - проверка regex паттерна
- `equals` - точное совпадение
- `jsonSchema` - валидация JSON Schema (упрощённая)

## Отчёты

### Console

```
✓ tomorrow-basic (123ms)
  Result: "Завтра все будет хорошо"
  Validation: contains "хорошо" ✓

Summary: 1 passed, 0 failed (123ms total)
All tests passed! ✓
```

### JUnit XML

Генерирует стандартный JUnit XML для интеграции с CI/CD системами.

## Зависимости

- `js-yaml` - парсинг YAML файлов

## Сборка

```bash
npm run build
```
