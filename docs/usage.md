# 📚 Использование инструментов

В этом разделе описаны практические примеры использования LSP-инструментов для навигации по коду.

---

## 🎯 Когда использовать какой инструмент

| Сценарий | Инструмент |
|----------|------------|
| Нужно найти, где определена функция/класс | `go_to_definition_by_name` |
| Нужно найти интерфейс, который реализует класс | `go_to_declaration_by_name` |
| Нужно узнать тип переменной | `go_to_type_definition_by_name` |
| Точно известны координаты символа | `go_to_definition` |

---

## 📖 Примеры использования

### Поиск определения класса

**Задача:** Найти, где определён класс `UserService`

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

**Результат:**

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

### Поиск интерфейса, который реализует класс

**Задача:** Найти интерфейс `IUserService`, который реализует класс

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

**Результат:**

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

---

### Определение типа переменной

**Задача:** Узнать, какой тип у переменной `user`

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

**Результат:**

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

---

### Навигация по координатам

**Задача:** Перейти к определению символа в конкретной позиции

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

**Результат:**

```
✅ Found 1 definition:

**Definition 1:**
  File: src/utils/processor.ts
  Position: Line 25, Character 10
```

---

## 🏷️ Фильтрация по SymbolKind

Параметр `symbol_kind` позволяет уточнить поиск, указав тип символа.

### Доступные типы символов

| SymbolKind | Описание |
|------------|----------|
| `File` | Файл |
| `Module` | Модуль |
| `Namespace` | Пространство имён |
| `Package` | Пакет |
| `Class` | Класс |
| `Method` | Метод |
| `Property` | Свойство |
| `Field` | Поле |
| `Constructor` | Конструктор |
| `Enum` | Перечисление |
| `Interface` | Интерфейс |
| `Function` | Функция |
| `Variable` | Переменная |
| `Constant` | Константа |
| `String` | Строка |
| `Number` | Число |
| `Boolean` | Логическое значение |
| `Array` | Массив |
| `Object` | Объект |
| `Key` | Ключ |
| `Null` | Null |
| `EnumMember` | Элемент перечисления |
| `Struct` | Структура |
| `Event` | Событие |
| `Operator` | Оператор |
| `TypeParameter` | Параметр типа |

### Примеры использования фильтрации

#### Поиск функции

```json
{
  "name": "go_to_definition_by_name",
  "parameters": {
    "file_path": "src/utils/helpers.ts",
    "symbol_name": "formatDate",
    "symbol_kind": "Function"
  }
}
```

#### Поиск интерфейса

```json
{
  "name": "go_to_definition_by_name",
  "parameters": {
    "file_path": "src/types/index.ts",
    "symbol_name": "UserConfig",
    "symbol_kind": "Interface"
  }
}
```

#### Поиск константы

```json
{
  "name": "go_to_definition_by_name",
  "parameters": {
    "file_path": "src/config/constants.ts",
    "symbol_name": "MAX_RETRIES",
    "symbol_kind": "Constant"
  }
}
```

---

## 💡 Советы по использованию

### 1. Выбор файла для поиска

При использовании `*_by_name` инструментов выбирайте файл, в котором:
- Символ используется (не обязательно определяется)
- LSP сервер может корректно разрешить символ

### 2. Использование фильтрации

Если в файле есть несколько символов с одинаковым именем (например, класс и интерфейс с именем `User`), используйте `symbol_kind` для уточнения:

```json
{
  "name": "go_to_definition_by_name",
  "parameters": {
    "file_path": "src/models/User.ts",
    "symbol_name": "User",
    "symbol_kind": "Class"
  }
}
```

### 3. Обработка пустых результатов

Если инструмент не нашёл определение:
- Проверьте правильность написания имени символа
- Убедитесь, что LSP сервер активен для данного языка
- Попробуйте другой файл, где используется этот символ

### 4. Работа с типами

Для `go_to_type_definition_by_name`:
- Примитивные типы (`string`, `number`, `boolean`) не имеют определений
- Union/Intersection типы могут не возвращать результаты
- Generic типы могут возвращать определение дженерика

---

## ⚠️ Типичные ошибки

### Символ не найден

```
❌ Symbol 'MyClass' not found in document
```

**Решение:** Убедитесь, что символ существует в указанном файле и правильно написано его имя.

### LSP сервер не активен

```
❌ No definition found
```

**Решение:** Откройте файл в редакторе и дождитесь инициализации LSP сервера.

### Неверный тип символа

```
❌ Symbol 'MyClass' with kind 'Function' not found
```

**Решение:** Проверьте правильность указанного `symbol_kind` или уберите этот параметр.

---

## 🔗 Навигация

- [← Обзор проекта](overview.md)
- [Установка и запуск ←](installation.md)
- [Тестовый фреймворк →](test-framework.md)
- [← Назад к README](../README.md)
