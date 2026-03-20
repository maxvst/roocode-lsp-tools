# 🔧 roocode-lsp-tools

**Набор LSP-инструментов для Roo-Code** — Custom Tools для навигации по коду с использованием Language Server Protocol через VSCode API.

## 📋 Содержание

- [Установленные инструменты](#-установленные-инструменты)
- [Преимущества *_by_name инструментов](#-преимущества-by_name-инструментов)
- [Документация инструментов](#-документация-инструментов)
  - [go_to_definition](#go_to_definition)
  - [go_to_definition_by_name](#go_to_definition_by_name)
  - [go_to_declaration_by_name](#go_to_declaration_by_name)
  - [go_to_type_definition_by_name](#go_to_type_definition_by_name)
  - [tommorow](#tommorow)
- [Структура проекта](#-структура-проекта)
- [Установка и запуск](#-установка-и-запуск)
- [Test Framework](#-test-framework)
- [Планируемые инструменты](#-планируемые-инструменты)
- [Ограничения](#-ограничения)
- [Технологии и зависимости](#-технологии-и-зависимости)

---

## 🛠️ Установленные инструменты

| Инструмент | Описание | Параметры |
|------------|----------|-----------|
| [`go_to_definition`](#go_to_definition) | Навигация к определению символа по координатам | `file_path`, `line`, `character` |
| [`go_to_definition_by_name`](#go_to_definition_by_name) | Навигация к определению по имени символа | `file_path`, `symbol_name`, `symbol_kind?` |
| [`go_to_declaration_by_name`](#go_to_declaration_by_name) | Навигация к объявлению (интерфейс/абстрактный класс) | `file_path`, `symbol_name`, `symbol_kind?` |
| [`go_to_type_definition_by_name`](#go_to_type_definition_by_name) | Навигация к определению типа | `file_path`, `symbol_name`, `symbol_kind?` |
| [`tommorow`](#tommorow) | Тестовый инструмент | нет |

---

## 🎯 Преимущества *_by_name инструментов

### Проблема "LLM галлюцинаций" координат

При использовании инструментов с координатами (`line`, `character`) LLM часто:
- Указывает неверные номера строк
- Неправильно вычисляет позицию символа
- Не учитывает изменения в коде

### Решение: навигация по имени

Инструменты `*_by_name` позволяют найти символ по его имени, что:
- ✅ Устраняет ошибки в координатах
- ✅ Работает независимо от позиции символа
- ✅ Более естественно для LLM (работа с семантикой, а не позициями)

### Сравнение подходов

| Критерий | По координатам | По имени |
|----------|----------------|----------|
| Точность | ❌ Зависит от LLM | ✅ Гарантирована LSP |
| Устойчивость к изменениям | ❌ Ломается при редактировании | ✅ Работает всегда |
| Естественность для LLM | ❌ Требует вычислений | ✅ Семантический подход |
| Скорость | ✅ Прямой доступ | ⚠️ Требует поиска |

---

## 📖 Документация инструментов

### go_to_definition

Находит определение символа в указанной позиции курсора.

**Параметры:**

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `file_path` | string | ✅ | Путь к файлу (относительно корня workspace) |
| `line` | number | ✅ | Номер строки (1-based, как в редакторе) |
| `character` | number | ✅ | Позиция символа (1-based, как в редакторе) |

**Пример вызова:**

```json
{
  "name": "go_to_definition",
  "parameters": {
    "file_path": "src/processor.ts",
    "line": 15,
    "character": 10
  }
}
```

**Пример результата:**

```
✅ Found 1 definition:

**Definition 1:**
  File: src/utils/processor.ts
  Position: Line 25, Character 10
```

---

### go_to_definition_by_name

Находит определение символа по его имени. Выполняет поиск символа в документе, затем переходит к его определению.

**Параметры:**

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `file_path` | string | ✅ | Путь к файлу для поиска символа |
| `symbol_name` | string | ✅ | Имя символа для поиска |
| `symbol_kind` | string | ❌ | Тип символа для фильтрации (см. SymbolKind) |

**Поддерживаемые SymbolKind (26 типов):**

```
File, Module, Namespace, Package, Class, Method, Property, Field,
Constructor, Enum, Interface, Function, Variable, Constant, String,
Number, Boolean, Array, Object, Key, Null, EnumMember, Struct,
Event, Operator, TypeParameter
```

**Пример вызова:**

```json
{
  "name": "go_to_definition_by_name",
  "parameters": {
    "file_path": "src/services/UserService.ts",
    "symbol_name": "UserService",
    "symbol_kind": "Class"
  }
}
```

**Пример результата:**

```json
{
  "locations": [
    {
      "uri": "file:///workspace/src/services/UserService.ts",
      "range": {
        "start": { "line": 5, "character": 0 },
        "end": { "line": 50, "character": 1 }
      }
    }
  ]
}
```

---

### go_to_declaration_by_name

Находит объявление символа (интерфейс или абстрактный класс), от которого наследуется или который реализует указанный символ.

**Параметры:**

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `file_path` | string | ✅ | Путь к файлу для поиска символа |
| `symbol_name` | string | ✅ | Имя символа для поиска |
| `symbol_kind` | string | ❌ | Тип символа для фильтрации |

**Пример вызова:**

```json
{
  "name": "go_to_declaration_by_name",
  "parameters": {
    "file_path": "src/services/UserService.ts",
    "symbol_name": "UserService",
    "symbol_kind": "Class"
  }
}
```

**Пример результата:**

```json
{
  "locations": [
    {
      "uri": "file:///workspace/src/interfaces/IUserService.ts",
      "range": {
        "start": { "line": 3, "character": 0 },
        "end": { "line": 20, "character": 1 }
      }
    }
  ]
}
```

**Примечание:** Если класс не реализует интерфейс и не наследуется от абстрактного класса, LSP сервер может не вернуть декларацию.

---

### go_to_type_definition_by_name

Находит определение типа переменной, параметра, свойства или возвращаемого значения.

**Параметры:**

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `file_path` | string | ✅ | Путь к файлу для поиска символа |
| `symbol_name` | string | ✅ | Имя символа для поиска |
| `symbol_kind` | string | ❌ | Тип символа для фильтрации |

**Пример вызова:**

```json
{
  "name": "go_to_type_definition_by_name",
  "parameters": {
    "file_path": "src/handlers/UserHandler.ts",
    "symbol_name": "user",
    "symbol_kind": "Variable"
  }
}
```

**Пример результата:**

```json
{
  "locations": [
    {
      "uri": "file:///workspace/src/models/User.ts",
      "range": {
        "start": { "line": 0, "character": 0 },
        "end": { "line": 15, "character": 1 }
      }
    }
  ]
}
```

**Примечание:** Для примитивных типов (`string`, `number`, `boolean`), union/intersection типов LSP может не вернуть определение типа.

---

### tommorow

Тестовый инструмент для проверки работоспособности фреймворка.

**Параметры:** нет

**Пример вызова:**

```json
{
  "name": "tommorow",
  "parameters": {}
}
```

---

## 📁 Структура проекта

```
roocode-lsp-tools/
├── src/                                    # Исходный код инструментов
│   ├── go_to_definition.ts                 # Навигация по координатам
│   ├── go_to_definition_by_name.ts         # Навигация к определению по имени
│   ├── go_to_declaration_by_name.ts        # Навигация к объявлению по имени
│   ├── go_to_type_definition_by_name.ts    # Навигация к типу по имени
│   ├── test.ts                             # Тестовый инструмент (tommorow)
│   ├── package.json                        # Зависимости src/
│   └── tsconfig.json                       # Конфигурация TypeScript
│
├── test-framework/                         # Тестовый фреймворк
│   ├── runner/                             # Isolated Runner
│   │   └── src/
│   │       ├── index.ts                    # Точка входа
│   │       ├── ipc-client.ts               # IPC клиент
│   │       ├── vscode-manager.ts           # Управление VSCode
│   │       └── types.ts                    # Типы
│   │
│   ├── toolstarter/                        # VSCode Extension
│   │   └── src/
│   │       ├── extension.ts                # Точка входа расширения
│   │       ├── ipc-server.ts               # IPC сервер (порт 9234)
│   │       ├── tool-loader.ts              # Загрузчик инструментов
│   │       ├── tool-registry.ts            # Реестр инструментов
│   │       └── validator.ts                # Валидация параметров
│   │
│   ├── test-logic/                         # Логика тестирования
│   │   └── src/
│   │       ├── index.ts                    # Экспорт модуля
│   │       ├── test-case-loader.ts         # Загрузка YAML тест-кейсов
│   │       ├── test-runner.ts              # Выполнение тестов
│   │       ├── reporter.ts                 # Формирование отчётов
│   │       └── types.ts                    # Типы
│   │
│   ├── test-cases/                         # YAML тест-кейсы
│   │   ├── test-go-to-definition.yaml      # 1 активный тест
│   │   ├── test-go-to-definition-by-name.yaml    # 9 активных тестов
│   │   ├── test-go-to-declaration-by-name.yaml   # 2 активных, ~20 отключенных
│   │   ├── test-go-to-type-definition-by-name.yaml # 30 активных, ~10 отключенных
│   │   └── test-tomorrow.yaml              # 3 активных теста
│   │
│   ├── test-workspace/                     # TypeScript файлы для тестов
│   │   ├── definition.ts
│   │   ├── declaration.ts
│   │   ├── typeDefinition.ts
│   │   ├── implementation.ts
│   │   └── ...                             # И другие файлы
│   │
│   ├── cli.ts                              # CLI интерфейс
│   ├── run-test.sh                         # Скрипт запуска
│   └── ARCHITECTURE.md                     # Документация архитектуры
│
├── docs/                                   # Документация
│   └── go_to_definition_redesign.md
│
├── plans/                                  # Планы разработки
│   └── go_to_definition_by_name_plan.md
│
├── .roo/                                   # Конфигурация Roo-Code
├── README.md                               # Этот файл
└── .gitignore
```

---

## 🚀 Установка и запуск

### Требования

- **Node.js** >= 18.x
- **VSCode** >= 1.85.0
- **TypeScript** >= 5.3.0

### Установка зависимостей

```bash
# Установка зависимостей для src/
cd src && npm install

# Установка зависимостей для test-framework
cd ../test-framework && npm install
cd runner && npm install
cd ../toolstarter && npm install
cd ../test-logic && npm install
```

### Сборка

```bash
# Сборка инструментов
cd src && npm run build

# Сборка test-framework
cd ../test-framework && npm run build
```

### Использование в Roo-Code

1. Скопируйте нужные инструменты из `src/` в `.roo/tools/` вашего проекта:

```bash
mkdir -p .roo/tools
cp src/go_to_definition_by_name.ts .roo/tools/
cp src/go_to_declaration_by_name.ts .roo/tools/
cp src/go_to_type_definition_by_name.ts .roo/tools/
```

2. Установите зависимости в корне проекта:

```bash
npm install @roo-code/types
```

3. Включите Custom Tools в Roo-Code:
   - Откройте настройки Roo-Code
   - Перейдите на вкладку "Experimental"
   - Включите "Enable custom tools"

---

## 🧪 Test Framework

Проект включает специализированный тестовый фреймворк для интеграционного тестирования custom tools в изолированной среде VSCode.

### Архитектура

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

### Компоненты

| Компонент | Назначение |
|-----------|------------|
| `runner/` | Запуск изолированного VSCode, IPC клиент |
| `toolstarter/` | VSCode extension, эмуляция RooCode, IPC сервер |
| `test-logic/` | Загрузка YAML тест-кейсов, валидация, отчёты |
| `test-cases/` | YAML файлы с тестовыми сценариями |
| `test-workspace/` | TypeScript файлы для тестирования LSP |

### Запуск тестов

```bash
# Через скрипт
cd test-framework
./run-test.sh test-cases/test-go-to-definition-by-name.yaml

# Через CLI
node cli.js test --verbose test-cases/test-go-to-type-definition-by-name.yaml

# Запуск всех тестов
node cli.js test --verbose test-cases/*.yaml
```

### Формат тест-кейса

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

### Статистика тестов

| Файл | Активных | Отключенных |
|------|----------|-------------|
| `test-go-to-definition.yaml` | 1 | 0 |
| `test-go-to-definition-by-name.yaml` | 9 | 0 |
| `test-go-to-declaration-by-name.yaml` | 2 | ~20 |
| `test-go-to-type-definition-by-name.yaml` | 30 | ~10 |
| `test-tomorrow.yaml` | 3 | 0 |

Подробная документация: [`test-framework/ARCHITECTURE.md`](test-framework/ARCHITECTURE.md)

---

## 📋 Планируемые инструменты

| Инструмент | Описание | Статус |
|------------|----------|--------|
| `find_references` | Поиск всех ссылок на символ | 🔲 Planned |
| `get_hover` | Информация о символе при наведении | 🔲 Planned |
| `get_completions` | Автодополнения кода | 🔲 Planned |
| `get_document_symbols` | Дерево символов документа | 🔲 Planned |
| `find_references_by_name` | Поиск ссылок по имени символа | 🔲 Planned |
| `get_call_hierarchy` | Иерархия вызовов | 🔲 Planned |
| `get_type_hierarchy` | Иерархия типов | 🔲 Planned |

---

## ⚠️ Ограничения

### LSP-зависимость

- LSP сервер может не возвращать декларации для некоторых типов символов
- Для корректной работы требуется активный LSP сервер для соответствующего языка
- Некоторые возможности зависят от конкретной реализации LSP сервера

### Типы данных

- **Union/Intersection типы** — LSP может не вернуть определение типа
- **Примитивные типы** (`string`, `number`, `boolean`, `null`, `undefined`) — не имеют определений
- **Generic типы** — могут возвращать определение дженерика, а не конкретного типа

### Формат результатов

- Инструменты возвращают строковые результаты (ограничение протокола Roo)
- Без интерактивного ввода во время выполнения
- При включённой функции Custom Tools инструменты выполняются без подтверждения

---

## 📦 Технологии и зависимости

### Основные зависимости (src/package.json)

| Пакет | Версия | Назначение |
|-------|--------|------------|
| `@roo-code/types` | `^1.115.0` | `defineCustomTool`, `parametersSchema` (Zod) |
| `@types/vscode` | `^1.85.0` | Типы VSCode Extension API |
| `@types/node` | `^20.10.0` | Типы Node.js |
| `typescript` | `^5.3.0` | Компилятор TypeScript |

### VSCode API

Инструменты используют следующие VSCode commands:

| Command | Инструмент |
|---------|------------|
| `vscode.executeDefinitionProvider` | `go_to_definition` |
| `vscode.executeDocumentSymbolProvider` | `*_by_name` (поиск символа) |
| `vscode.executeDeclarationProvider` | `go_to_declaration_by_name` |
| `vscode.executeTypeDefinitionProvider` | `go_to_type_definition_by_name` |

---

## 📄 Лицензия

MIT

---

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для функции (`git checkout -b feature/amazing-feature`)
3. Закоммитьте изменения (`git commit -m 'Add amazing feature'`)
4. Запушьте ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request
