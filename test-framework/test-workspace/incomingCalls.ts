/**
 * ============================================================================
 * LSP Method: callHierarchy/incomingCalls
 * Description: Поиск входящих вызовов (кто вызывает эту функцию)
 * ============================================================================
 * 
 * Этот файл содержит тестовые сценарии для проверки LSP-метода
 * callHierarchy/incomingCalls, который находит все места, откуда
 * вызывается данная функция или метод.
 */

import { processUser, formatOutput } from './incomingCalls-deps/callers';
import { CallbackProcessor, DataHandler } from './incomingCalls-deps/callbacks';
import { InterfaceUser, IUserService } from './incomingCalls-deps/interfaces';

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ
// ============================================================================

/**
 * LSP Method: callHierarchy/incomingCalls
 * Description: Поиск входящих вызовов (кто вызывает эту функцию)
 * 
 * Test Case 1: Функция, вызываемая из нескольких мест
 * Symbol: calculateSum (позиция: строка ~28)
 * Command: callHierarchy/incomingCalls
 * Expected: 
 *   - incomingCalls-deps/callers.ts: processUser() - вызывает calculateSum
 *   - incomingCalls-deps/callers.ts: calculateTotal() - вызывает calculateSum
 *   - Локальный вызов в testLocalCall() ниже в этом файле
 */
export function calculateSum(a: number, b: number): number {
    return a + b;
}

/**
 * Тестовая функция для проверки локального вызова calculateSum
 */
export function testLocalCall(): number {
    return calculateSum(5, 10);
}

/**
 * LSP Method: callHierarchy/incomingCalls
 * Description: Поиск входящих вызовов (кто вызывает эту функцию)
 * 
 * Test Case 2: Метод класса, вызываемый из других методов
 * Symbol: UserService.getUserName (позиция: строка ~52)
 * Command: callHierarchy/incomingCalls
 * Expected:
 *   - incomingCalls-deps/callers.ts: processUser() - вызывает getUserName
 *   - incomingCalls-deps/callers.ts: displayUserInfo() - вызывает getUserName
 */
export class UserService {
    private userName: string;

    constructor(name: string) {
        this.userName = name;
    }

    public getUserName(): string {
        return this.userName;
    }

    public setUserName(name: string): void {
        this.userName = name;
    }
}

/**
 * LSP Method: callHierarchy/incomingCalls
 * Description: Поиск входящих вызовов (кто вызывает эту функцию)
 * 
 * Test Case 3: Рекурсивная функция (вызывает сама себя)
 * Symbol: factorial (позиция: строка ~80)
 * Command: callHierarchy/incomingCalls
 * Expected:
 *   - factorial() сама себя (рекурсивный вызов)
 *   - incomingCalls-deps/callers.ts: testFactorial() - вызывает factorial
 *   - Локальный вызов в testRecursive() ниже
 */
export function factorial(n: number): number {
    if (n <= 1) {
        return 1;
    }
    // Рекурсивный вызов - должен отображаться во входящих вызовах
    return n * factorial(n - 1);
}

/**
 * Тестовая функция для проверки вызова рекурсивной функции
 */
export function testRecursive(): number {
    return factorial(5);
}

/**
 * LSP Method: callHierarchy/incomingCalls
 * Description: Поиск входящих вызовов (кто вызывает эту функцию)
 * 
 * Test Case 4: Функция обратного вызова (callback)
 * Symbol: handleCallback (позиция: строка ~108)
 * Command: callHierarchy/incomingCalls
 * Expected:
 *   - incomingCalls-deps/callbacks.ts: CallbackProcessor.execute() - передаёт handleCallback как callback
 *   - incomingCalls-deps/callbacks.ts: runCallback() - вызывает handleCallback
 */
export function handleCallback(data: string): void {
    console.log(`Callback received: ${data}`);
}

/**
 * LSP Method: callHierarchy/incomingCalls
 * Description: Поиск входящих вызовов (кто вызывает эту функцию)
 * 
 * Test Case 5: Метод, вызываемый через интерфейс
 * Symbol: UserServiceImpl.getData (позиция: строка ~124)
 * Command: callHierarchy/incomingCalls
 * Expected:
 *   - incomingCalls-deps/interfaces.ts: InterfaceUser.useService() - вызывает через интерфейс
 *   - incomingCalls-deps/interfaces.ts: consumeData() - вызывает getData
 */
export class UserServiceImpl implements IUserService {
    private data: string;

    constructor(initialData: string) {
        this.data = initialData;
    }

    public getData(): string {
        return this.data;
    }

    public setData(newData: string): void {
        this.data = newData;
    }
}

/**
 * LSP Method: callHierarchy/incomingCalls
 * Description: Поиск входящих вызовов (кто вызывает эту функцию)
 * 
 * Test Case 6: Статический метод класса
 * Symbol: HelperUtil.formatString (позиция: строка ~150)
 * Command: callHierarchy/incomingCalls
 * Expected:
 *   - incomingCalls-deps/callers.ts: formatOutput() - вызывает HelperUtil.formatString
 *   - Локальный вызов в testStaticMethod() ниже
 */
export class HelperUtil {
    public static formatString(input: string): string {
        return `[${input}]`;
    }

    public static parseString(input: string): string {
        return input.replace(/[\[\]]/g, '');
    }
}

/**
 * Тестовая функция для проверки вызова статического метода
 */
export function testStaticMethod(): string {
    return HelperUtil.formatString('test');
}

/**
 * LSP Method: callHierarchy/incomingCalls
 * Description: Поиск входящих вызовов (кто вызывает эту функцию)
 * 
 * Test Case 7: Асинхронная функция
 * Symbol: fetchData (позиция: строка ~176)
 * Command: callHierarchy/incomingCalls
 * Expected:
 *   - incomingCalls-deps/callers.ts: loadData() - вызывает fetchData
 *   - Локальный вызов в testAsyncCall() ниже
 */
export async function fetchData(url: string): Promise<string> {
    // Симуляция асинхронного запроса
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`Data from ${url}`);
        }, 100);
    });
}

/**
 * Тестовая функция для проверки вызова асинхронной функции
 */
export async function testAsyncCall(): Promise<string> {
    return await fetchData('https://example.com');
}

/**
 * LSP Method: callHierarchy/incomingCalls
 * Description: Поиск входящих вызовов (кто вызывает эту функцию)
 * 
 * Test Case 8: Функция с несколькими параметрами
 * Symbol: combineValues (позиция: строка ~202)
 * Command: callHierarchy/incomingCalls
 * Expected:
 *   - incomingCalls-deps/callers.ts: mergeData() - вызывает combineValues
 */
export function combineValues<T, U>(first: T, second: U): { first: T; second: U } {
    return { first, second };
}

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ
// ============================================================================

/**
 * LSP Method: callHierarchy/incomingCalls
 * Description: Поиск входящих вызовов (кто вызывает эту функцию)
 * 
 * Test Case 9 (NEGATIVE): Функция, которая нигде не вызывается (dead code)
 * Symbol: unusedFunction (позиция: строка ~220)
 * Command: callHierarchy/incomingCalls
 * Expected: Пустой результат (нет входящих вызовов)
 */
export function unusedFunction(): void {
    console.log('Эта функция никогда не вызывается');
}

/**
 * LSP Method: callHierarchy/incomingCalls
 * Description: Поиск входящих вызовов (кто вызывает эту функцию)
 * 
 * Test Case 10 (NEGATIVE): Экспортируемая, но неиспользуемая функция
 * Symbol: exportedButUnused (позиция: строка ~232)
 * Command: callHierarchy/incomingCalls
 * Expected: Пустой результат (экспортируется, но нигде не импортируется/вызывается)
 */
export function exportedButUnused(value: number): string {
    return `Value: ${value}`;
}

/**
 * LSP Method: callHierarchy/incomingCalls
 * Description: Поиск входящих вызовов (кто вызывает эту функцию)
 * 
 * Test Case 11 (NEGATIVE): Приватный метод, не вызываемый в классе
 * Symbol: UnusedClass.privateMethod (позиция: строка ~244)
 * Command: callHierarchy/incomingCalls
 * Expected: Пустой результат (приватный метод без вызовов)
 */
export class UnusedClass {
    private privateMethod(): void {
        console.log('Приватный метод без вызовов');
    }

    public publicMethod(): void {
        // Не вызывает privateMethod
        console.log('Публичный метод');
    }
}

// ============================================================================
// ПРИМИТИВНЫЕ ЗНАЧЕНИЯ (НЕ ВЫЗЫВАЕМЫЕ)
// ============================================================================

/**
 * LSP Method: callHierarchy/incomingCalls
 * Description: Поиск входящих вызовов (кто вызывает эту функцию)
 * 
 * Test Case 12 (NEGATIVE): Примитивное значение - переменная
 * Symbol: primitiveValue (позиция: строка ~268)
 * Command: callHierarchy/incomingCalls
 * Expected: Ошибка или пустой результат (переменная не является вызываемой)
 */
export const primitiveValue: string = 'Это не функция';

/**
 * LSP Method: callHierarchy/incomingCalls
 * Description: Поиск входящих вызовов (кто вызывает эту функцию)
 * 
 * Test Case 13 (NEGATIVE): Примитивное значение - число
 * Symbol: numericConstant (позиция: строка ~279)
 * Command: callHierarchy/incomingCalls
 * Expected: Ошибка или пустой результат (число не является вызываемым)
 */
export const numericConstant: number = 42;

/**
 * LSP Method: callHierarchy/incomingCalls
 * Description: Поиск входящих вызовов (кто вызывает эту функцию)
 * 
 * Test Case 14 (NEGATIVE): Объект без вызываемых свойств
 * Symbol: dataObject (позиция: строка ~290)
 * Command: callHierarchy/incomingCalls
 * Expected: Ошибка или пустой результат (объект не является функцией)
 */
export const dataObject: { name: string; value: number } = {
    name: 'test',
    value: 100
};

// ============================================================================
// ДОПОЛНИТЕЛЬНЫЕ ТЕСТОВЫЕ СЦЕНАРИИ
// ============================================================================

/**
 * LSP Method: callHierarchy/incomingCalls
 * Description: Поиск входящих вызовов (кто вызывает эту функцию)
 * 
 * Test Case 15: Функция с вызовами из колбэков
 * Symbol: callbackTarget (позиция: строка ~308)
 * Command: callHierarchy/incomingCalls
 * Expected:
 *   - incomingCalls-deps/callbacks.ts: CallbackProcessor.execute() - вызывает через колбэк
 */
export function callbackTarget(message: string): void {
    console.log(`Target: ${message}`);
}

/**
 * LSP Method: callHierarchy/incomingCalls
 * Description: Поиск входящих вызовов (кто вызывает эту функцию)
 * 
 * Test Case 16: Метод, вызываемый в цепочке
 * Symbol: ChainHelper.step1 (позиция: строка ~322)
 * Command: callHierarchy/incomingCalls
 * Expected:
 *   - incomingCalls-deps/callers.ts: runChain() - вызывает step1
 */
export class ChainHelper {
    public step1(): ChainHelper {
        return this;
    }

    public step2(): ChainHelper {
        return this;
    }

    public step3(): string {
        return 'completed';
    }
}

/**
 * LSP Method: callHierarchy/incomingCalls
 * Description: Поиск входящих вызовов (кто вызывает эту функцию)
 * 
 * Test Case 17: Геттер свойства
 * Symbol: DataContainer.computedValue (позиция: строка ~346)
 * Command: callHierarchy/incomingCalls
 * Expected:
 *   - incomingCalls-deps/callers.ts: readComputedValue() - обращается к computedValue
 */
export class DataContainer {
    private _value: number = 0;

    public get computedValue(): number {
        return this._value * 2;
    }

    public set value(newValue: number) {
        this._value = newValue;
    }
}

// ============================================================================
// ЭКСПОРТ ДЛЯ ИСПОЛЬЗОВАНИЯ В ЗАВИСИМОСТЯХ
// ============================================================================

// Создаём экземпляры для использования в тестах
export const userServiceInstance = new UserService('TestUser');
export const userServiceImpl = new UserServiceImpl('Initial Data');
export const dataContainer = new DataContainer();
export const chainHelper = new ChainHelper();
