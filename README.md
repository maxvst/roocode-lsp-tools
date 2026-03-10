# @roo-code/lsp-tools

LSP (Language Server Protocol) Custom Tools для Roo-Code. Этот пакет предоставляет готовые инструменты для взаимодействия с LSP-серверами через VSCode API в формате `defineCustomTool`.

## Описание

Пакет предоставляет 5 LSP-инструментов в формате Custom Tools:

| Инструмент | Описание | VSCode API |
|------------|----------|------------|
| `go_to_definition` | Находит определение символа | `vscode.executeDefinitionProvider` |
| `find_references` | Находит все ссылки на символ | `vscode.executeReferenceProvider` |
| `get_hover` | Получает информацию о символе при наведении | `vscode.executeHoverProvider` |
| `get_completions` | Получает автодополнения кода | `vscode.executeCompletionItemProvider` |
| `get_document_symbols` | Получает дерево символов документа | `vscode.executeDocumentSymbolProvider` |

## ⚠️ Экспериментальная функция

Custom Tools — это экспериментальная функция Roo-Code. При включении инструменты автоматически одобряются — Roo не будет запрашивать разрешение перед выполнением. Включайте эту функцию только если доверяете коду инструментов.

## Установка

### Шаг 1: Копирование инструментов

Скопируйте файлы из директории `tools/` в ваш проект:

```bash
# Создайте директорию для custom tools
mkdir -p .roo/tools

# Скопируйте нужные инструменты
cp node_modules/@roo-code/lsp-tools/tools/*.ts .roo/tools/
```

### Шаг 2: Установка зависимостей

```bash
# Вариант 1: Установка в корне проекта (рекомендуется)
# Roo-Code автоматически найдёт пакет в node_modules проекта
npm install @roo-code/types

# Вариант 2: Установка в .roo/tools/ (опционально)
cd .roo/tools
npm init -y
npm install @roo-code/types
```

### Зависимости

LSP-инструменты используют `@roo-code/types` — пакет предоставляет `defineCustomTool` и `parametersSchema` (Zod).

**Важно:** Roo-Code автоматически резолвит этот импорт через `nodePaths`:
1. Ищет в `.roo/tools/node_modules/` (если установлен локально)
2. Ищет в `node_modules/` корня проекта

Достаточно установить пакет в корне проекта:
```bash
npm install @roo-code/types
```

Другие зависимости:
- `vscode` — предоставляется VSCode Extension API (установка не требуется)
- `path` — встроенный модуль Node.js

### Шаг 3: Включение Custom Tools

1. Откройте настройки Roo-Code (иконка шестерёнки в правом верхнем углу)
2. Перейдите на вкладку "Experimental"
3. Включите "Enable custom tools"

## Структура проекта

```
roo-code-lsp-tools/
├── tools/                      # Custom Tools для копирования в .roo/tools/
│   ├── go_to_definition.ts     # Навигация к определению
│   ├── find_references.ts      # Поиск ссылок
│   ├── get_hover.ts            # Информация при наведении
│   ├── get_completions.ts      # Автодополнения
│   └── get_document_symbols.ts # Символы документа
├── package.json                # Метаданные пакета
├── .gitignore
└── README.md
```

## Использование

### Формат Custom Tool

Каждый инструмент использует формат `defineCustomTool`:

```typescript
import { parametersSchema as z, defineCustomTool } from "@roo-code/types"
import * as vscode from "vscode"
import path from "path"

export default defineCustomTool({
  name: "go_to_definition",
  description: "Find the definition of a symbol...",
  parameters: z.object({
    file_path: z.string().describe("Path to the file"),
    line: z.number().describe("1-based line number"),
    character: z.number().describe("1-based character position"),
  }),
  async execute({ file_path, line, character }, context) {
    // context.task.cwd - рабочая директория
    // Возвращается строка - результат для LLM
    return "Result string"
  }
})
```

### Примеры использования в Roo-Code

#### go_to_definition

```
Найди определение функции processData в файле src/processor.ts на строке 15
```

Roo вызовет:
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

#### find_references

```
Найди все места, где используется класс UserService
```

#### get_hover

```
Какой тип у переменной config на строке 25 в файле src/config.ts?
```

#### get_completions

```
Какие методы доступны у объекта user на строке 42?
```

#### get_document_symbols

```
Покажи структуру файла src/api.ts
```

## API Документация

### go_to_definition

Находит определение символа в указанной позиции.

**Параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `file_path` | string | Путь к файлу (относительно корня workspace) |
| `line` | number | Номер строки (1-based, как в редакторе) |
| `character` | number | Позиция символа (1-based, как в редакторе) |

**Пример результата:**
```
✅ Found 1 definition:

**Definition 1:**
  File: /path/to/definition.ts
  Position: Line 25, Character 10
```

---

### find_references

Находит все ссылки на символ в проекте.

**Параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `file_path` | string | Путь к файлу |
| `line` | number | Номер строки (1-based) |
| `character` | number | Позиция символа (1-based) |

**Пример результата:**
```
✅ Found 15 references in 4 files:

**/path/to/file1.ts** (8 references)
  1. Line 10, Character 5
  2. Line 25, Character 12
  ...

**/path/to/file2.ts** (7 references)
  1. Line 5, Character 8
  ...
```

---

### get_hover

Получает информацию о символе при наведении (тип, документация).

**Параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `file_path` | string | Путь к файлу |
| `line` | number | Номер строки (1-based) |
| `character` | number | Позиция символа (1-based) |

**Пример результата:**
```
✅ Hover information:

```typescript
function processData(input: string): ProcessedData
```

*Applies to: Lines 10-10, Characters 5-25*
```

---

### get_completions

Получает список автодополнений в указанной позиции.

**Параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `file_path` | string | Путь к файлу |
| `line` | number | Номер строки (1-based) |
| `character` | number | Позиция символа (1-based) |
| `trigger_character` | string? | Опционально: символ-триггер (например, '.') |

**Пример результата:**
```
✅ Found 25 completion suggestions:

**Method** (10)
  - `processData` - Process the input data
  - `validateInput` - Validate user input
  ...

**Variable** (8)
  - `config` - Configuration object
  - `state` - Current state
  ...
```

---

### get_document_symbols

Получает дерево символов документа (классы, функции, переменные).

**Параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `file_path` | string | Путь к файлу |

**Пример результата:**
```
✅ Found 12 symbols in document:

- **MyClass** (Class) [Line 10]
  • **constructor** (Constructor) [Line 12]
  • **processData** (Method) [Line 20]
  • **validate** (Method) [Line 35]
- **helperFunction** (Function) [Line 50]
- **CONFIG** (Constant) [Line 60]
```

## Troubleshooting

### "LSP server not available"

**Проблема:** Инструмент возвращает ошибку о недоступности LSP сервера.

**Решения:**
1. Убедитесь, что для данного типа файлов установлен и активен соответствующий LSP сервер
2. Откройте файл в редакторе перед вызовом инструмента
3. Проверьте, что LSP сервер запущен (см. Output panel)

### "File not found"

**Проблема:** Файл не найден.

**Решения:**
1. Используйте путь относительно корня workspace
2. Проверьте правильность написания пути
3. Убедитесь, что файл существует

### "No definition/references found"

**Проблема:** Инструмент не находит определения или ссылки.

**Решения:**
1. Убедитесь, что позиция указывает на символ (не на пробел или комментарий)
2. Проверьте, что LSP сервер поддерживает данную функциональность
3. Для некоторых языков требуется индексация проекта

### Позиции 1-based vs 0-based

**Важно:** Все позиции в API используют 1-based нумерацию (как в редакторе).

```typescript
// Правильно (1-based, как в редакторе)
{ line: 10, character: 5 }

// Неправильно (0-based)
{ line: 9, character: 4 }
```

### Инструменты не появляются в Roo

**Проблема:** Roo не видит custom tools.

**Решения:**
1. Убедитесь, что включена опция "Enable custom tools" в Experimental настройках
2. Выполните команду "Refresh Custom Tools" через Command Palette
3. Перезагрузите окно VSCode (Developer: Reload Window)

## Ограничения

- **Только строковые результаты:** Инструменты должны возвращать строки (ограничение протокола Roo)
- **Без интерактивного ввода:** Инструменты не могут запрашивать ввод у пользователя во время выполнения
- **Автоодобрение:** При включенной функции инструменты выполняются без подтверждения

## Разработка

### Локальное тестирование

1. Скопируйте файлы из `tools/` в `.roo/tools/` вашего тестового проекта
2. Установите зависимости: `npm install @roo-code/types` (в корне проекта)
3. Включите Custom Tools в настройках Roo-Code
4. Выполните "Refresh Custom Tools"

### Добавление нового инструмента

Создайте новый файл в `tools/` по шаблону:

```typescript
import { parametersSchema as z, defineCustomTool } from "@roo-code/types"
import * as vscode from "vscode"
import path from "path"

export default defineCustomTool({
  name: "my_lsp_tool",
  description: "Description of what the tool does",
  parameters: z.object({
    file_path: z.string().describe("Path to the file"),
    // другие параметры...
  }),
  async execute({ file_path }, context) {
    const workspaceRoot = context.task.cwd
    const fullPath = path.join(workspaceRoot, file_path)
    
    try {
      // Выполнение VSCode API
      const result = await vscode.commands.executeCommand(...)
      return `✅ Result: ${formatResult(result)}`
    } catch (error) {
      return `❌ Error: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})
```

## Лицензия

MIT
