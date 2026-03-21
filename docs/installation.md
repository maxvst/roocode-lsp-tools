# 🚀 Установка и запуск

## 📋 Требования

| Компонент | Версия |
|-----------|--------|
| **Node.js** | >= 18.x |
| **VSCode** | >= 1.85.0 |
| **TypeScript** | >= 5.3.0 |

---

## 📦 Установка зависимостей

### Шаг 1: Клонирование репозитория

```bash
git clone https://github.com/your-username/roocode-lsp-tools.git
cd roocode-lsp-tools
```

### Шаг 2: Установка зависимостей для инструментов

```bash
# Установка зависимостей для src/
cd src && npm install
```

### Шаг 3: Установка зависимостей для тестового фреймворка

```bash
# Установка зависимостей для test-framework
cd ../test-framework && npm install
cd runner && npm install
cd ../toolstarter && npm install
cd ../test-logic && npm install
```

---

## 🔨 Сборка

### Сборка инструментов

```bash
cd src && npm run build
```

### Сборка test-framework

```bash
cd ../test-framework && npm run build
```

---

## ⚙️ Использование в Roo-Code

### Шаг 1: Копирование инструментов

Скопируйте нужные инструменты из `src/` в `.roo/tools/` вашего проекта:

```bash
mkdir -p .roo/tools
cp src/go_to_definition_by_name.ts .roo/tools/
cp src/go_to_declaration_by_name.ts .roo/tools/
cp src/go_to_type_definition_by_name.ts .roo/tools/
```

### Шаг 2: Установка зависимостей в проекте

Установите необходимые зависимости в корне вашего проекта:

```bash
npm install @roo-code/types
```

### Шаг 3: Включение Custom Tools в Roo-Code

1. Откройте настройки Roo-Code
2. Перейдите на вкладку **"Experimental"**
3. Включите опцию **"Enable custom tools"**

---

## 🧪 Запуск тестов

Для проверки работоспособности инструментов используйте тестовый фреймворк:

```bash
# Через скрипт
cd test-framework
./run-test.sh test-cases/test-go-to-definition-by-name.yaml

# Через CLI
node cli.js test --verbose test-cases/test-go-to-type-definition-by-name.yaml

# Запуск всех тестов
node cli.js test --verbose test-cases/*.yaml
```

> 📖 Подробная документация тестового фреймворка: [test-framework.md](test-framework.md)

---

## 🔧 Конфигурация

### Структура .roo/tools/

Рекомендуемая структура директории с инструментами:

```
.roo/
└── tools/
    ├── go_to_definition_by_name.ts
    ├── go_to_declaration_by_name.ts
    └── go_to_type_definition_by_name.ts
```

### Проверка установки

После настройки инструменты должны появиться в списке доступных custom tools в Roo-Code.

---

## ❓ Устранение неполадок

### Инструменты не появляются в Roo-Code

1. Убедитесь, что опция "Enable custom tools" включена
2. Проверьте, что файлы `.ts` скомпилированы без ошибок
3. Перезапустите VSCode

### Ошибки при выполнении инструментов

1. Убедитесь, что LSP сервер активен для вашего языка
2. Проверьте, что файл, к которому обращается инструмент, существует
3. Убедитесь, что символ, который вы ищете, существует в указанном файле

### Проблемы с тестовым фреймворком

1. Убедитесь, что все зависимости установлены во всех подпапках `test-framework/`
2. Проверьте, что порт 9234 не занят другим процессом
3. См. [Known Issues](../README.md#-known-issues) в README

---

## 🔗 Навигация

- [← Обзор проекта](overview.md)
- [Использование инструментов →](usage.md)
- [Тестовый фреймворк →](test-framework.md)
- [← Назад к README](../README.md)
