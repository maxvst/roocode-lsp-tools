# 🧪 Тестовый фреймворк

Проект включает специализированный тестовый фреймворк для интеграционного тестирования custom tools в изолированной среде VSCode.

---

## 🏗️ Архитектура

```
┌─────────────────┐     IPC (порт 9234)     ┌─────────────────┐
│     Runner      │ ◄─────────────────────► │   ToolStarter   │
│  (Node.js CLI)  │                         │ (VSCode Ext)    │
└────────┬────────┘                         └────────┬────────┘
         │                                           │
         │ Загружает                                 │ Выполняет
         ▼                                           ▼
┌─────────────────┐                         ┌─────────────────┐
│   Test Logic    │                         │   Custom Tool   │
│  (YAML → Test)  │                         │  (LSP запрос)   │
└─────────────────┘                         └─────────────────┘
```

### Компоненты системы

| Компонент | Расположение | Назначение |
|-----------|--------------|------------|
| **Runner** | `runner/` | Запуск изолированного VSCode, IPC клиент |
| **ToolStarter** | `toolstarter/` | VSCode extension, эмуляция RooCode, IPC сервер |
| **Test Logic** | `test-logic/` | Загрузка YAML тест-кейсов, валидация, отчёты |
| **Test Cases** | `test-cases/` | YAML файлы с тестовыми сценариями |
| **Test Workspace** | `test-workspace/` | TypeScript файлы для тестирования LSP |

---

## 🚀 Запуск тестов

### Через bash-скрипт

```bash
cd test-framework
./run-test.sh test-cases/test-go-to-definition-by-name.yaml
```

### Через CLI

```bash
# Запуск конкретного тест-кейса
node cli.js test --verbose test-cases/test-go-to-type-definition-by-name.yaml

# Запуск всех тестов
node cli.js test --verbose test-cases/*.yaml
```

### Параметры CLI

| Параметр | Описание |
|----------|----------|
| `test` | Команда запуска тестов |
| `--verbose` | Подробный вывод |
| `--timeout <ms>` | Таймаут выполнения (по умолчанию 30000) |

---

## 📝 Формат тест-кейса

### Структура YAML файла

```yaml
name: "Test Go To Definition By Name"
description: "Тестирование навигации по имени"

testCases:
  - id: "find-class-definition"
    description: "Поиск определения класса"
    enabled: true
    toolPath: "../src/go_to_definition_by_name.ts"
    toolName: "go_to_definition_by_name"
    params:
      file_path: "test-workspace/definition.ts"
      symbol_name: "MyClass"
      symbol_kind: "Class"
    expected:
      success: true
      contains: "definition.ts"
```

### Поля тест-кейса

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `id` | string | ✅ | Уникальный идентификатор теста |
| `description` | string | ✅ | Описание теста |
| `enabled` | boolean | ❌ | Включён ли тест (по умолчанию `true`) |
| `toolPath` | string | ✅ | Путь к файлу инструмента |
| `toolName` | string | ✅ | Имя инструмента |
| `params` | object | ✅ | Параметры вызова инструмента |
| `expected` | object | ✅ | Ожидаемый результат |

### Проверки результата

| Поле | Описание |
|------|----------|
| `success` | Ожидаемый статус выполнения (true/false) |
| `contains` | Строка, которая должна содержаться в результате |
| `notContains` | Строка, которая НЕ должна содержаться в результате |
| `matchRegex` | Регулярное выражение для проверки результата |

---

## 📊 Статистика тестов

| Файл | Активных | Отключенных |
|------|----------|-------------|
| `test-go-to-definition.yaml` | 1 | 0 |
| `test-go-to-definition-by-name.yaml` | 9 | 0 |
| `test-go-to-declaration-by-name.yaml` | 2 | ~20 |
| `test-go-to-type-definition-by-name.yaml` | 30 | ~10 |
| `test-tomorrow.yaml` | 3 | 0 |

---

## 📁 Структура test-workspace

Директория `test-workspace/` содержит TypeScript файлы для тестирования различных LSP-операций:

```
test-workspace/
├── definition.ts              # Тесты go_to_definition
├── declaration.ts             # Тесты go_to_declaration
├── typeDefinition.ts          # Тесты go_to_type_definition
├── implementation.ts          # Тесты implementation
├── references.ts              # Тесты find_references
├── incomingCalls.ts           # Тесты call hierarchy
├── outgoingCalls.ts           # Тесты call hierarchy
├── subtypes.ts                # Тесты type hierarchy
├── supertypes.ts              # Тесты type hierarchy
├── tsconfig.json              # Конфигурация TypeScript
└── *-deps/                    # Зависимости для тестов
    ├── definition-deps/
    ├── declaration-deps/
    ├── typeDefinition-deps/
    └── ...
```

---

## 🔧 Примеры тест-кейсов

### Тест успешного поиска определения

```yaml
testCases:
  - id: "find-class-definition"
    description: "Поиск определения класса"
    enabled: true
    toolPath: "../src/go_to_definition_by_name.ts"
    toolName: "go_to_definition_by_name"
    params:
      file_path: "test-workspace/definition.ts"
      symbol_name: "MyClass"
      symbol_kind: "Class"
    expected:
      success: true
      contains: "definition.ts"
```

### Тест с проверкой regex

```yaml
testCases:
  - id: "find-function-definition"
    description: "Поиск определения функции"
    enabled: true
    toolPath: "../src/go_to_definition_by_name.ts"
    toolName: "go_to_definition_by_name"
    params:
      file_path: "test-workspace/definition.ts"
      symbol_name: "myFunction"
      symbol_kind: "Function"
    expected:
      success: true
      matchRegex: '"line":\\s*\\d+'
```

### Отключенный тест

```yaml
testCases:
  - id: "broken-test"
    description: "Тест с известной проблемой"
    enabled: false
    toolPath: "../src/go_to_definition_by_name.ts"
    toolName: "go_to_definition_by_name"
    params:
      file_path: "test-workspace/definition.ts"
      symbol_name: "NonExistent"
    expected:
      success: false
```

---

## 🏃 Компоненты фреймворка

### Runner (`runner/`)

Отвечает за:
- Запуск изолированного экземпляра VSCode
- Подключение к IPC серверу
- Отправку команд на выполнение тестов
- Получение результатов

**Ключевые файлы:**
- [`runner/src/index.ts`](../test-framework/runner/src/index.ts) — точка входа
- [`runner/src/ipc-client.ts`](../test-framework/runner/src/ipc-client.ts) — IPC клиент
- [`runner/src/vscode-manager.ts`](../test-framework/runner/src/vscode-manager.ts) — управление VSCode

### ToolStarter (`toolstarter/`)

VSCode extension, который:
- Запускается в изолированном VSCode
- Предоставляет IPC сервер на порту 9234
- Эмулирует среду RooCode
- Выполняет custom tools

**Ключевые файлы:**
- [`toolstarter/src/extension.ts`](../test-framework/toolstarter/src/extension.ts) — точка входа расширения
- [`toolstarter/src/ipc-server.ts`](../test-framework/toolstarter/src/ipc-server.ts) — IPC сервер
- [`toolstarter/src/tool-registry.ts`](../test-framework/toolstarter/src/tool-registry.ts) — реестр инструментов

### Test Logic (`test-logic/`)

Библиотека для:
- Загрузки YAML тест-кейсов
- Валидации параметров
- Выполнения тестов
- Формирования отчётов

**Ключевые файлы:**
- [`test-logic/src/test-case-loader.ts`](../test-framework/test-logic/src/test-case-loader.ts) — загрузка тестов
- [`test-logic/src/test-runner.ts`](../test-framework/test-logic/src/test-runner.ts) — выполнение тестов
- [`test-logic/src/reporter.ts`](../test-framework/test-logic/src/reporter.ts) — отчёты

---

## 📖 Дополнительная документация

- [ARCHITECTURE.md](../test-framework/ARCHITECTURE.md) — подробная документация архитектуры
- [test-logic/README.md](../test-framework/test-logic/README.md) — документация test-logic
- [toolstarter/README.md](../test-framework/toolstarter/README.md) — документация toolstarter

---

## 🔗 Навигация

- [← Обзор проекта](overview.md)
- [Установка и запуск ←](installation.md)
- [Использование инструментов ←](usage.md)
- [← Назад к README](../README.md)
