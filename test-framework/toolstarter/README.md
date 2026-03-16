# ToolStarter Extension

VSCode extension, эмулирующий хост RooCode для тестирования custom tools.

## Назначение

ToolStarter - это VSCode extension, который:

1. Автоматически запускается при старте VSCode
2. Открывает IPC сервер на порту 9876 (настраивается)
3. Принимает команды на выполнение tools от Test Runner
4. Загружает TypeScript файлы tools через esbuild
5. Выполняет tools с эмуляцией RooCode контекста
6. Валидирует результаты по заданным критериям
7. Возвращает результаты через IPC

## Установка

```bash
cd test-framework/toolstarter
npm install
npm run build
```

## Запуск

### В режиме разработки

```bash
# В VSCode: F5 для запуска extension в debug режиме
# Или через командную строку:
code --extensionDevelopmentPath=$(pwd) /path/to/test/workspace
```

### Конфигурация

Extension настраивается через VSCode settings:

```json
{
  "toolstarter.port": 9876,
  "toolstarter.autoStart": true,
  "toolstarter.timeout": 30000
}
```

## IPC Протокол

### Входящие сообщения

#### runTest - Выполнение tool

```json
{
  "type": "runTest",
  "payload": {
    "toolPath": "src/test.ts",
    "toolName": "tommorow",
    "params": {},
    "expected": {
      "contains": "хорошо"
    }
  }
}
```

#### shutdown - Завершение работы

```json
{
  "type": "shutdown",
  "payload": {}
}
```

#### ping - Проверка соединения

```json
{
  "type": "ping",
  "payload": {}
}
```

### Исходящие сообщения

#### testResult - Результат выполнения

```json
{
  "type": "testResult",
  "payload": {
    "success": true,
    "output": "Завтра будет хорошая погода!",
    "error": null,
    "duration": 42
  }
}
```

#### error - Ошибка

```json
{
  "type": "error",
  "payload": {
    "message": "Tool not found"
  }
}
```

#### pong - Ответ на ping

```json
{
  "type": "pong",
  "payload": {}
}
```

## Команды

| Команда | Описание |
|---------|----------|
| `toolstarter.runTest` | Запуск теста вручную |
| `toolstarter.showStatus` | Показать статус extension |
| `toolstarter.reloadTools` | Очистить реестр tools |
| `toolstarter.startServer` | Запустить IPC сервер |
| `toolstarter.stopServer` | Остановить IPC сервер |

## Структура

```
test-framework/toolstarter/
├── src/
│   ├── extension.ts     # Точка входа VSCode extension
│   ├── ipc-server.ts    # TCP сервер для IPC
│   ├── tool-registry.ts # Реестр custom tools
│   ├── tool-loader.ts   # Загрузчик .ts файлов через esbuild
│   ├── validator.ts     # Валидация результатов
│   ├── types.ts         # Типы и интерфейсы
│   └── index.ts         # Публичный API
├── package.json         # Манифест VSCode extension
├── tsconfig.json        # Конфигурация TypeScript
└── README.md            # Этот файл
```

## Совместимость с Runner

ToolStarter использует типы, совместимые с `test-framework/runner/src/types.ts`:

- `ToolExecutionRequest` - запрос на выполнение
- `ToolExecutionResponse` - ответ с результатом
- `ExpectedResult` - критерии валидации

## Пример использования

### Подключение к ToolStarter

```typescript
import * as net from 'net';

const client = new net.Socket();
client.connect(9876, '127.0.0.1', () => {
  // Отправляем запрос на выполнение теста
  const request = {
    type: 'runTest',
    payload: {
      toolPath: 'src/test.ts',
      toolName: 'tommorow',
      params: {},
      expected: { contains: 'хорошо' }
    }
  };
  client.write(JSON.stringify(request) + '\n');
});

client.on('data', (data) => {
  const response = JSON.parse(data.toString());
  console.log('Result:', response);
});
```

## Ограничения

- **КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО** импортировать что-либо из `3rd-projects`
- Используется esbuild для транспиляции (как в RooCode)
- Код работает только на Linux

## Лицензия

MIT
