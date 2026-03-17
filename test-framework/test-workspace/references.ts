/**
 * ============================================================================
 * LSP Method: textDocument/references
 * Description: Поиск всех ссылок на символ в проекте
 * ============================================================================
 * 
 * Этот файл содержит тестовые сценарии для метода textDocument/references.
 * Метод позволяет найти все места в проекте, где используется данный символ.
 * 
 * Связанные файлы:
 * - references-deps/usage.ts - использует символы из этого файла
 */

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ПЕРЕМЕННАЯ, ИСПОЛЬЗУЕМАЯ В НЕСКОЛЬКИХ МЕСТАХ
// ============================================================================

/**
 * Test Case 1: Переменная, используемая в нескольких местах
 * Symbol: globalCounter
 * Description: Глобальная переменная-счётчик, используемая в разных местах
 * Command: textDocument/references на globalCounter
 * Expected: 
 *   - Объявление (этот файл)
 *   - Чтение в incrementGlobalCounter() (этот файл)
 *   - Использование в references-deps/usage.ts
 */
export let globalCounter: number = 0;

/**
 * Test Case 1.1: Функция, использующая globalCounter
 * Symbol: incrementGlobalCounter
 * Description: Функция увеличивает счётчик
 */
export function incrementGlobalCounter(): number {
    // Ссылка на globalCounter - чтение и запись
    globalCounter++;
    return globalCounter;
}

/**
 * Test Case 1.2: Функция, читающая globalCounter
 */
export function getGlobalCounter(): number {
    // Ссылка на globalCounter - только чтение
    return globalCounter;
}

/**
 * Test Case 1.3: Сброс счётчика
 */
export function resetGlobalCounter(): void {
    // Ссылка на globalCounter - запись
    globalCounter = 0;
}

/**
 * Test Case 2: Объект конфигурации
 * Symbol: appConfig
 * Description: Объект конфигурации, используемый в разных модулях
 * Command: textDocument/references на appConfig
 * Expected:
 *   - Объявление (этот файл)
 *   - Использование в getConfig() (этот файл)
 *   - Использование в references-deps/usage.ts
 */
export const appConfig: Record<string, unknown> = {
    appName: 'Test Application',
    version: '1.0.0',
    debug: true,
};

/**
 * Test Case 2.1: Получение конфигурации
 */
export function getConfig(): Record<string, unknown> {
    // Ссылка на appConfig
    return { ...appConfig };
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ФУНКЦИЯ, ВЫЗЫВАЕМАЯ ИЗ РАЗНЫХ ФАЙЛОВ
// ============================================================================

/**
 * Test Case 3: Функция, вызываемая из разных файлов
 * Symbol: calculateSum
 * Description: Функция сложения чисел, вызываемая из разных модулей
 * Command: textDocument/references на calculateSum
 * Expected:
 *   - Объявление функции (этот файл)
 *   - Вызов в computeAverage() (этот файл)
 *   - Вызов в references-deps/usage.ts
 */
export function calculateSum(numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0);
}

/**
 * Test Case 3.1: Функция, использующая calculateSum
 */
export function computeAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    // Ссылка на calculateSum - вызов функции
    const sum = calculateSum(numbers);
    return sum / numbers.length;
}

/**
 * Test Case 4: Функция форматирования
 * Symbol: formatString
 * Description: Функция форматирования строки
 * Command: textDocument/references на formatString
 * Expected:
 *   - Объявление (этот файл)
 *   - Вызов в formatMessage() (этот файл)
 *   - Вызов в references-deps/usage.ts
 */
export function formatString(input: string): string {
    return `[FORMATTED] ${input.trim().toUpperCase()}`;
}

/**
 * Test Case 4.1: Использование formatString
 */
export function formatMessage(title: string, content: string): string {
    // Ссылка на formatString
    return `${formatString(title)}: ${content}`;
}

/**
 * Test Case 5: Функция валидации
 * Symbol: validateInput
 * Description: Функция валидации ввода
 * Command: textDocument/references на validateInput
 * Expected:
 *   - Объявление (этот файл)
 *   - Вызов в processInput() (этот файл)
 *   - Вызов в references-deps/usage.ts
 */
export function validateInput(input: string): boolean {
    return input !== null && input !== undefined && input.length > 0;
}

/**
 * Test Case 5.1: Использование validateInput
 */
export function processInput(input: string | null): string {
    // Ссылка на validateInput
    if (!validateInput(input || '')) {
        return 'Invalid input';
    }
    return `Processed: ${input}`;
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: КЛАСС, ИНСТАНЦИРУЕМЫЙ В РАЗНЫХ МОДУЛЯХ
// ============================================================================

/**
 * Test Case 6: Класс, инстанцируемый в разных модулях
 * Symbol: DataItem
 * Description: Класс элемента данных, создаваемый в разных файлах
 * Command: textDocument/references на DataItem
 * Expected:
 *   - Объявление класса (этот файл)
 *   - Создание в createSampleItem() (этот файл)
 *   - Использование в ItemProcessor (этот файл)
 *   - Создание в references-deps/usage.ts
 */
export class DataItem {
    constructor(
        public readonly id: string,
        public value: unknown,
        public createdAt: Date = new Date()
    ) {}

    toString(): string {
        return `DataItem(${this.id}): ${JSON.stringify(this.value)}`;
    }
}

/**
 * Test Case 6.1: Создание экземпляра DataItem
 */
export function createSampleItem(): DataItem {
    // Ссылка на DataItem - создание экземпляра
    return new DataItem('sample', { data: 'test' });
}

/**
 * Test Case 6.2: Массив DataItem
 */
export function createItemCollection(): DataItem[] {
    // Ссылка на DataItem - тип массива
    const items: DataItem[] = [];
    
    for (let i = 0; i < 3; i++) {
        // Ссылка на DataItem - создание в цикле
        items.push(new DataItem(`item-${i}`, { index: i }));
    }
    
    return items;
}

/**
 * Test Case 7: Класс процессора
 * Symbol: ItemProcessor
 * Description: Класс для обработки элементов данных
 * Command: textDocument/references на ItemProcessor
 * Expected:
 *   - Объявление класса (этот файл)
 *   - Использование в processItemsWithProcessor() (этот файл)
 *   - Использование в references-deps/usage.ts
 */
export class ItemProcessor {
    private results: unknown[] = [];

    /**
     * Test Case Reference: ItemProcessor.process
     * Symbol: process (метод ItemProcessor)
     * Description: Метод обработки элемента
     */
    process(item: DataItem): void {
        this.results.push(item.value);
    }

    getResults(): unknown[] {
        return [...this.results];
    }

    clear(): void {
        this.results = [];
    }
}

/**
 * Test Case 7.1: Использование ItemProcessor
 */
export function processItemsWithProcessor(items: DataItem[]): unknown[] {
    // Ссылка на ItemProcessor - создание экземпляра
    const processor = new ItemProcessor();
    
    items.forEach(item => {
        processor.process(item);
    });
    
    return processor.getResults();
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ИНТЕРФЕЙС КАК ТИП И КАК РЕАЛИЗАЦИЯ
// ============================================================================

/**
 * Test Case 8: Интерфейс как тип и как реализация
 * Symbol: Serializable
 * Description: Интерфейс для сериализации объектов
 * Command: textDocument/references на Serializable
 * Expected:
 *   - Объявление интерфейса (этот файл)
 *   - Реализация в SerializedObject (этот файл)
 *   - Использование как типа в serializeItems() (этот файл)
 *   - Использование в references-deps/usage.ts
 */
export interface Serializable {
    serialize(): string;
    deserialize(data: string): void;
}

/**
 * Test Case 8.1: Класс, реализующий Serializable
 */
export class SerializedObject implements Serializable {
    constructor(private data: Record<string, unknown> = {}) {}

    // Ссылка на Serializable - реализация интерфейса
    serialize(): string {
        return JSON.stringify(this.data);
    }

    deserialize(data: string): void {
        this.data = JSON.parse(data);
    }
}

/**
 * Test Case 8.2: Функция, использующая Serializable как тип
 */
export function serializeItems(items: Serializable[]): string[] {
    // Ссылка на Serializable - тип параметра
    return items.map(item => item.serialize());
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ENUM ЗНАЧЕНИЕ, ИСПОЛЬЗУЕМОЕ В SWITCH/CASE
// ============================================================================

/**
 * Test Case 9: Enum для статуса
 * Symbol: Status
 * Description: Enum для представления статуса объекта
 * Command: textDocument/references на Status
 * Expected:
 *   - Объявление enum (этот файл)
 *   - Использование в getStatusLabel() (этот файл)
 *   - Использование в switchStatus() (этот файл)
 *   - Использование в references-deps/usage.ts
 */
export enum Status {
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
    Pending = 'PENDING',
    Completed = 'COMPLETED',
}

/**
 * Test Case 9.1: Функция с использованием Status
 */
export function getStatusLabel(status: Status): string {
    // Ссылка на Status - тип параметра
    switch (status) {
        case Status.Active:
            return 'Активный';
        case Status.Inactive:
            return 'Неактивный';
        case Status.Pending:
            return 'В ожидании';
        case Status.Completed:
            return 'Завершён';
    }
}

/**
 * Test Case 9.2: Функция переключения статуса
 */
export function switchStatus(current: Status): Status {
    // Ссылка на Status - тип возвращаемого значения и сравнения
    if (current === Status.Active) {
        return Status.Inactive;
    } else if (current === Status.Inactive) {
        return Status.Active;
    } else if (current === Status.Pending) {
        return Status.Completed;
    }
    return Status.Pending;
}

/**
 * Test Case 10: Enum для приоритета
 * Symbol: Priority
 * Description: Enum для представления приоритета
 * Command: textDocument/references на Priority
 * Expected:
 *   - Объявление enum (этот файл)
 *   - Использование в getPriorityWeight() (этот файл)
 *   - Использование в references-deps/usage.ts
 */
export enum Priority {
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4,
}

/**
 * Test Case 10.1: Функция с использованием Priority
 */
export function getPriorityWeight(priority: Priority): number {
    // Ссылка на Priority - тип параметра и значения
    switch (priority) {
        case Priority.Low:
            return 1;
        case Priority.Medium:
            return 2;
        case Priority.High:
            return 3;
        case Priority.Critical:
            return 4;
    }
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ЭКСПОРТИРУЕМЫЙ СИМВОЛ, ИМПОРТИРУЕМЫЙ В ДРУГИХ ФАЙЛАХ
// ============================================================================

/**
 * Test Case 11: Константа MAX_ITEMS
 * Symbol: MAX_ITEMS
 * Description: Максимальное количество элементов
 * Command: textDocument/references на MAX_ITEMS
 * Expected:
 *   - Объявление (этот файл)
 *   - Использование в validateMaxItems() (этот файл)
 *   - Импорт и использование в references-deps/usage.ts
 */
export const MAX_ITEMS = 100;

/**
 * Test Case 11.1: Использование MAX_ITEMS
 */
export function validateMaxItems(count: number): boolean {
    // Ссылка на MAX_ITEMS
    return count >= 0 && count <= MAX_ITEMS;
}

/**
 * Test Case 12: Константа DEFAULT_TIMEOUT
 * Symbol: DEFAULT_TIMEOUT
 * Description: Таймаут по умолчанию в миллисекундах
 * Command: textDocument/references на DEFAULT_TIMEOUT
 * Expected:
 *   - Объявление (этот файл)
 *   - Использование в createTimeout() (этот файл)
 *   - Импорт и использование в references-deps/usage.ts
 */
export const DEFAULT_TIMEOUT = 5000;

/**
 * Test Case 12.1: Использование DEFAULT_TIMEOUT
 */
export function createTimeout(callback: () => void): NodeJS.Timeout {
    // Ссылка на DEFAULT_TIMEOUT
    return setTimeout(callback, DEFAULT_TIMEOUT);
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ПАРАМЕТР ФУНКЦИИ, ИСПОЛЬЗУЕМЫЙ В ТЕЛЕ
// ============================================================================

/**
 * Test Case 13: Параметр функции, используемый в теле
 * Symbol: inputParameter (в multiplyByTwo)
 * Description: Параметр функции, используемый несколько раз в теле
 * Command: textDocument/references на inputParameter
 * Expected:
 *   - Объявление параметра
 *   - Использование в return
 *   - Использование в console.log
 */
export function multiplyByTwo(inputParameter: number): number {
    // Ссылка на inputParameter - логирование
    console.log(`Умножаем ${inputParameter} на 2`);
    
    // Ссылка на inputParameter - вычисление
    return inputParameter * 2;
}

/**
 * Test Case 14: Несколько параметров
 * Symbol: firstName, lastName (в getFullName)
 * Description: Параметры, используемые для формирования результата
 */
export function getFullName(firstName: string, lastName: string): string {
    // Ссылка на firstName
    // Ссылка на lastName
    return `${firstName} ${lastName}`;
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: СВОЙСТВО КЛАССА, ИСПОЛЬЗУЕМОЕ В МЕТОДАХ
// ============================================================================

/**
 * Test Case 15: Свойство класса, используемое в методах
 * Symbol: Counter.counterValue
 * Description: Приватное свойство, используемое в нескольких методах
 * Command: textDocument/references на counterValue
 * Expected:
 *   - Объявление свойства
 *   - Использование в increment()
 *   - Использование в decrement()
 *   - Использование в getValue()
 */
export class Counter {
    /**
     * Test Case Reference: Counter.counterValue
     */
    private counterValue: number = 0;

    increment(): void {
        // Ссылка на counterValue
        this.counterValue++;
    }

    decrement(): void {
        // Ссылка на counterValue
        this.counterValue--;
    }

    getValue(): number {
        // Ссылка на counterValue
        return this.counterValue;
    }

    reset(): void {
        // Ссылка на counterValue
        this.counterValue = 0;
    }
}

/**
 * Test Case 16: Публичное свойство класса
 * Symbol: Entity.name, Entity.id
 * Description: Публичные свойства, используемые внутри и снаружи класса
 */
export class Entity {
    constructor(
        public id: string,
        public name: string
    ) {}

    getDisplayName(): string {
        // Ссылка на name
        // Ссылка на id
        return `${this.name} (${this.id})`;
    }

    updateName(newName: string): void {
        // Ссылка на name
        this.name = newName;
    }
}

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ: ЛОКАЛЬНАЯ ПЕРЕМЕННАЯ, ОБЪЯВЛЕННАЯ НО НЕ ИСПОЛЬЗОВАННАЯ
// ============================================================================

/**
 * Test Case 17 (NEGATIVE): Локальная переменная, объявленная но не использованная
 * Symbol: unusedLocalVariable
 * Description: Переменная, которая объявлена, но нигде не используется
 * Command: textDocument/references на unusedLocalVariable
 * Expected: Только объявление (нет других ссылок)
 */
export function functionWithUnusedVariable(): number {
    // Ссылка на unusedLocalVariable - только объявление
    const unusedLocalVariable = 'Эта переменная не используется';
    const usedVariable = 42;
    
    // unusedLocalVariable не используется дальше
    return usedVariable;
}

/**
 * Test Case 18 (NEGATIVE): Неиспользуемый параметр
 * Symbol: _unusedParam
 * Description: Параметр с подчёркиванием, который не используется
 * Command: textDocument/references на _unusedParam
 * Expected: Только объявление
 */
export function functionWithUnusedParam(_unusedParam: string, usedParam: number): number {
    // _unusedParam не используется
    return usedParam * 2;
}

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ: ПРИВАТНЫЙ СИМВОЛ, НЕ ИСПОЛЬЗУЕМЫЙ ВНЕ КЛАССА
// ============================================================================

/**
 * Test Case 19 (NEGATIVE): Приватный метод класса
 * Symbol: PrivateService.privateHelper
 * Description: Приватный метод, используемый только внутри класса
 * Command: textDocument/references на privateHelper
 * Expected: Только объявления и использования внутри класса
 */
export class PrivateService {
    private data: unknown[] = [];

    /**
     * Test Case Reference: PrivateService.privateHelper
     * Приватный метод - нет ссылок извне
     */
    private privateHelper(): string {
        return 'private helper result';
    }

    public publicMethod(): string {
        // Ссылка на privateHelper - только внутри класса
        return this.privateHelper();
    }

    public anotherPublicMethod(): void {
        // Ссылка на privateHelper - только внутри класса
        console.log(this.privateHelper());
    }
}

/**
 * Test Case 20 (NEGATIVE): Приватное статическое свойство
 * Symbol: PrivateService.instanceCount
 * Description: Приватное статическое свойство
 * Command: textDocument/references на instanceCount
 * Expected: Только использования внутри класса
 */
export class SingletonService {
    /**
     * Test Case Reference: SingletonService.instanceCount
     */
    private static instanceCount: number = 0;

    constructor() {
        // Ссылка на instanceCount
        SingletonService.instanceCount++;
    }

    public static getInstanceCount(): number {
        // Ссылка на instanceCount
        return SingletonService.instanceCount;
    }
}

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ: СИМВОЛ ИЗ ВНЕШНЕЙ БИБЛИОТЕКИ
// ============================================================================

/**
 * Test Case 21 (NEGATIVE): Встроенный тип
 * Symbol: console
 * Description: Глобальный объект console из Node.js
 * Command: textDocument/references на console
 * Expected: Только использования в этом проекте (не определение)
 * 
 * Примечание: console - это глобальный объект Node.js/браузера,
 * его определение находится во внешних типах (lib.dom.d.ts или @types/node)
 */
export function logMessage(message: string): void {
    // Ссылка на console - глобальный объект
    console.log(message);
}

/**
 * Test Case 22 (NEGATIVE): Встроенный класс
 * Symbol: Promise
 * Description: Встроенный класс Promise
 * Command: textDocument/references на Promise
 * Expected: Только использования в проекте
 */
export function asyncOperation(): Promise<string> {
    // Ссылка на Promise - встроенный класс
    return new Promise((resolve) => {
        resolve('result');
    });
}

/**
 * Test Case 23 (NEGATIVE): Встроенный интерфейс
 * Symbol: Array
 * Description: Встроенный интерфейс массива
 * Command: textDocument/references на Array
 * Expected: Только использования в проекте
 */
export function processArray(items: Array<number>): number {
    // Ссылка на Array - встроенный интерфейс
    return items.reduce((sum, item) => sum + item, 0);
}

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ: DEAD CODE
// ============================================================================

/**
 * Test Case 24 (NEGATIVE): Dead code - экспортируемая функция без вызовов
 * Symbol: deadFunction
 * Description: Функция экспортируется, но нигде не вызывается
 * Command: textDocument/references на deadFunction
 * Expected: Только объявление (нет вызовов)
 */
export function deadFunction(): string {
    return 'Эта функция экспортируется, но нигде не вызывается';
}

/**
 * Test Case 25 (NEGATIVE): Dead code - неиспользуемый класс
 * Symbol: UnusedClass
 * Description: Класс экспортируется, но нигде не инстанцируется
 * Command: textDocument/references на UnusedClass
 * Expected: Только объявление
 */
export class UnusedClass {
    constructor(public value: string) {}

    getValue(): string {
        return this.value;
    }
}

/**
 * Test Case 26 (NEGATIVE): Dead code - неиспользуемая константа
 * Symbol: UNUSED_CONSTANT
 * Description: Экспортируемая константа без использований
 * Command: textDocument/references на UNUSED_CONSTANT
 * Expected: Только объявление
 */
export const UNUSED_CONSTANT = 'Эта константа нигде не используется';

// ============================================================================
// ДОПОЛНИТЕЛЬНЫЕ ТЕСТОВЫЕ СЛУЧАИ
// ============================================================================

/**
 * Test Case 27: Символ с множественными ссылками в одном файле
 * Symbol: multiReferenceSymbol
 * Description: Переменная с множественными использованиями
 * Command: textDocument/references на multiReferenceSymbol
 * Expected: Все использования в этом файле
 */
export const multiReferenceSymbol = 'symbol-value';

export function useSymbol1(): string {
    // Ссылка на multiReferenceSymbol
    return multiReferenceSymbol;
}

export function useSymbol2(): string {
    // Ссылка на multiReferenceSymbol
    return `Value: ${multiReferenceSymbol}`;
}

export function useSymbol3(): boolean {
    // Ссылка на multiReferenceSymbol
    return multiReferenceSymbol.length > 0;
}

/**
 * Test Case 28: Деструктурированный объект
 * Symbol: destructuredProperty
 * Description: Свойство, извлечённое через деструктуризацию
 */
export const configObject = {
    destructuredProperty: 'value',
    otherProperty: 123,
};

export function useDestructured(): string {
    // Ссылка на destructuredProperty через деструктуризацию
    const { destructuredProperty } = configObject;
    return destructuredProperty;
}

/**
 * Test Case 29: Переэкспорт символа
 * Symbol: reexportedSymbol
 * Description: Символ, который переэкспортируется
 */
export const reexportedSymbol = 'reexported';

// ============================================================================
// ЭКСПОРТ ТИПОВ ДЛЯ ИСПОЛЬЗОВАНИЯ В ДРУГИХ ФАЙЛАХ
// ============================================================================

export type {
    Serializable as ISerializable,
};
