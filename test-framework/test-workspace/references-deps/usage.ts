/**
 * LSP Method: textDocument/references
 * Description: Файл с использованием символов из основного тестового файла references.ts
 * 
 * Этот файл содержит импорты и использование различных символов для тестирования
 * поиска ссылок (references) на символы.
 */

// ============================================================================
// ИМПОРТ СИМВОЛОВ ИЗ ОСНОВНОГО ФАЙЛА
// ============================================================================

import {
    // Переменные для тестирования ссылок
    globalCounter,
    appConfig,
    
    // Функции для тестирования ссылок
    calculateSum,
    formatString,
    validateInput,
    
    // Классы для тестирования ссылок
    DataItem,
    ItemProcessor,
    
    // Enum для тестирования ссылок
    Status,
    Priority,
    
    // Интерфейсы для тестирования ссылок
    Serializable,
    
    // Константы для тестирования
    MAX_ITEMS,
    DEFAULT_TIMEOUT,
} from '../references';

// ============================================================================
// ИСПОЛЬЗОВАНИЕ ПЕРЕМЕННЫХ (Test Case: Переменная, используемая в нескольких местах)
// ============================================================================

/**
 * Test Case Reference: globalCounter
 * Symbol: globalCounter (из references.ts)
 * Description: Использование глобального счётчика в другом файле
 * Command: textDocument/references на globalCounter в references.ts
 * Expected: Должен найти это использование
 */
export function incrementCounter(): number {
    // Ссылка на globalCounter - чтение
    const currentValue = globalCounter;
    
    // Ссылка на globalCounter - запись (через экспортируемую функцию)
    console.log(`Текущее значение счётчика: ${currentValue}`);
    
    return currentValue;
}

/**
 * Test Case Reference: appConfig
 * Symbol: appConfig (из references.ts)
 * Description: Использование конфигурации приложения
 * Command: textDocument/references на appConfig в references.ts
 * Expected: Должен найти это использование
 */
export function getConfigValue(key: string): unknown {
    // Ссылка на appConfig
    return appConfig[key];
}

export function updateConfig(key: string, value: unknown): void {
    // Ссылка на appConfig
    appConfig[key] = value;
}

// ============================================================================
// ИСПОЛЬЗОВАНИЕ ФУНКЦИЙ (Test Case: Функция, вызываемая из разных файлов)
// ============================================================================

/**
 * Test Case Reference: calculateSum
 * Symbol: calculateSum (из references.ts)
 * Description: Вызов функции сложения из другого файла
 * Command: textDocument/references на calculateSum в references.ts
 * Expected: Должен найти этот вызов
 */
export function computeTotal(numbers: number[]): number {
    // Ссылка на calculateSum - вызов функции
    return calculateSum(numbers);
}

/**
 * Test Case Reference: formatString
 * Symbol: formatString (из references.ts)
 * Description: Вызов функции форматирования из другого файла
 * Command: textDocument/references на formatString в references.ts
 * Expected: Должен найти этот вызов
 */
export function formatOutput(label: string, value: number): string {
    // Ссылка на formatString - вызов функции
    return formatString(`${label}: ${value}`);
}

/**
 * Test Case Reference: validateInput
 * Symbol: validateInput (из references.ts)
 * Description: Вызов функции валидации из другого файла
 * Command: textDocument/references на validateInput в references.ts
 * Expected: Должен найти этот вызов
 */
export function processUserInput(input: string): string | null {
    // Ссылка на validateInput - вызов функции
    if (!validateInput(input)) {
        return null;
    }
    
    return formatString(`Обработано: ${input}`);
}

// ============================================================================
// ИСПОЛЬЗОВАНИЕ КЛАССОВ (Test Case: Класс, инстанцируемый в разных модулях)
// ============================================================================

/**
 * Test Case Reference: DataItem
 * Symbol: DataItem (из references.ts)
 * Description: Создание экземпляров класса в другом файле
 * Command: textDocument/references на DataItem в references.ts
 * Expected: Должен найти это использование
 */
export function createDataItem(id: string, value: unknown): DataItem {
    // Ссылка на DataItem - создание экземпляра
    return new DataItem(id, value);
}

export function createMultipleItems(count: number): DataItem[] {
    const items: DataItem[] = [];
    
    for (let i = 0; i < count; i++) {
        // Ссылка на DataItem - создание экземпляра в цикле
        const item = new DataItem(`item-${i}`, { index: i });
        items.push(item);
    }
    
    return items;
}

/**
 * Test Case Reference: ItemProcessor
 * Symbol: ItemProcessor (из references.ts)
 * Description: Использование класса процессора в другом файле
 * Command: textDocument/references на ItemProcessor в references.ts
 * Expected: Должен найти это использование
 */
export function processItems(items: DataItem[]): unknown[] {
    // Ссылка на ItemProcessor - создание экземпляра
    const processor = new ItemProcessor();
    
    // Использование методов процессора
    items.forEach(item => processor.process(item));
    
    return processor.getResults();
}

// ============================================================================
// ИСПОЛЬЗОВАНИЕ ENUM (Test Case: Enum значение, используемое в switch/case)
// ============================================================================

/**
 * Test Case Reference: Status
 * Symbol: Status (из references.ts)
 * Description: Использование enum статуса в другом файле
 * Command: textDocument/references на Status в references.ts
 * Expected: Должен найти это использование
 */
export function handleStatus(status: Status): string {
    // Ссылка на Status - использование в switch
    switch (status) {
        case Status.Active:
            return 'Активный статус';
        case Status.Inactive:
            return 'Неактивный статус';
        case Status.Pending:
            return 'Ожидание';
        case Status.Completed:
            return 'Завершено';
        default:
            return 'Неизвестный статус';
    }
}

/**
 * Test Case Reference: Status.Active
 * Symbol: Status.Active (из references.ts)
 * Description: Использование конкретного значения enum
 * Command: textDocument/references на Status.Active в references.ts
 * Expected: Должен найти это использование
 */
export function isItemActive(status: Status): boolean {
    // Ссылка на Status.Active - сравнение
    return status === Status.Active;
}

/**
 * Test Case Reference: Priority
 * Symbol: Priority (из references.ts)
 * Description: Использование enum приоритета
 * Command: textDocument/references на Priority в references.ts
 * Expected: Должен найти это использование
 */
export function getPriorityLabel(priority: Priority): string {
    // Ссылка на Priority - использование всех значений
    switch (priority) {
        case Priority.Low:
            return 'Низкий приоритет';
        case Priority.Medium:
            return 'Средний приоритет';
        case Priority.High:
            return 'Высокий приоритет';
        case Priority.Critical:
            return 'Критический приоритет';
    }
}

// ============================================================================
// ИСПОЛЬЗОВАНИЕ ИНТЕРФЕЙСОВ (Test Case: Интерфейс как тип)
// ============================================================================

/**
 * Test Case Reference: Serializable
 * Symbol: Serializable (из references.ts)
 * Description: Использование интерфейса как типа в другом файле
 * Command: textDocument/references на Serializable в references.ts
 * Expected: Должен найти это использование
 */
export function serializeObject(obj: Serializable): string {
    // Ссылка на Serializable - использование как типа параметра
    return obj.serialize();
}

export function processSerializable(items: Serializable[]): string[] {
    // Ссылка на Serializable - использование в типе массива
    return items.map(item => item.serialize());
}

// ============================================================================
// ИСПОЛЬЗОВАНИЕ КОНСТАНТ
// ============================================================================

/**
 * Test Case Reference: MAX_ITEMS
 * Symbol: MAX_ITEMS (из references.ts)
 * Description: Использование константы лимита элементов
 * Command: textDocument/references на MAX_ITEMS в references.ts
 * Expected: Должен найти это использование
 */
export function validateItemCount(items: unknown[]): boolean {
    // Ссылка на MAX_ITEMS - проверка лимита
    return items.length <= MAX_ITEMS;
}

export function truncateItems<T>(items: T[]): T[] {
    // Ссылка на MAX_ITEMS - ограничение количества
    return items.slice(0, MAX_ITEMS);
}

/**
 * Test Case Reference: DEFAULT_TIMEOUT
 * Symbol: DEFAULT_TIMEOUT (из references.ts)
 * Description: Использование константы таймаута
 * Command: textDocument/references на DEFAULT_TIMEOUT в references.ts
 * Expected: Должен найти это использование
 */
export function waitForOperation(): Promise<void> {
    // Ссылка на DEFAULT_TIMEOUT - использование в setTimeout
    return new Promise(resolve => {
        setTimeout(resolve, DEFAULT_TIMEOUT);
    });
}

// ============================================================================
// ЭКСПОРТ ФУНКЦИИ ДЛЯ ИСПОЛЬЗОВАНИЯ В ДРУГИХ ФАЙЛАХ
// ============================================================================

/**
 * Вспомогательная функция для демонстрации цепочки ссылок
 */
export function useAllImports(): void {
    console.log('Использование всех импортированных символов:');
    console.log('Counter:', incrementCounter());
    console.log('Config:', getConfigValue('key'));
    console.log('Sum:', computeTotal([1, 2, 3]));
    console.log('Status:', handleStatus(Status.Active));
    console.log('Priority:', getPriorityLabel(Priority.High));
    console.log('Max items:', MAX_ITEMS);
    console.log('Timeout:', DEFAULT_TIMEOUT);
}
