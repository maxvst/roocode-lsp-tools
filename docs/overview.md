# 📖 Обзор проекта roocode-lsp-tools

## 🎯 Назначение

**roocode-lsp-tools** — набор Custom Tools для Roo-Code, обеспечивающий навигацию по коду с использованием Language Server Protocol (LSP) через VSCode API.

Проект решает проблему интеграции код-агентов с LSP-серверами, позволяя LLM использовать семантический анализ кода вместо текстового поиска.

---

## 🛠️ Доступные инструменты

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

> 📝 **Примечание:** Если класс не реализует интерфейс и не наследуется от абстрактного класса, LSP сервер может не вернуть декларацию.

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

> 📝 **Примечание:** Для примитивных типов (`string`, `number`, `boolean`), union/intersection типов LSP может не вернуть определение типа.

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
│   ├── toolstarter/                        # VSCode Extension
│   ├── test-logic/                         # Логика тестирования
│   ├── test-cases/                         # YAML тест-кейсы
│   └── test-workspace/                     # TypeScript файлы для тестов
│
├── docs/                                   # Документация
├── plans/                                  # Планы разработки
├── .roo/                                   # Конфигурация Roo-Code
└── README.md                               # Точка входа
```

---

## 🔗 Навигация

- [← Назад к README](../README.md)
- [Установка и запуск →](installation.md)
- [Использование инструментов →](usage.md)
- [Тестовый фреймворк →](test-framework.md)
