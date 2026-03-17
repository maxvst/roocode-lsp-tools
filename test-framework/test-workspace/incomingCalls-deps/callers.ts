/**
 * ============================================================================
 * Файл зависимостей для тестирования callHierarchy/incomingCalls
 * Description: Функции-caller'ы, которые вызывают тестируемые функции
 * ============================================================================
 * 
 * Этот файл содержит функции, которые импортируют и вызывают функции
 * из incomingCalls.ts для тестирования поиска входящих вызовов.
 */

import {
    calculateSum,
    UserService,
    factorial,
    HelperUtil,
    fetchData,
    combineValues,
    ChainHelper,
    DataContainer,
    userServiceInstance
} from '../incomingCalls';

// ============================================================================
// CALLER'Ы ДЛЯ ФУНКЦИИ calculateSum
// ============================================================================

/**
 * Эта функция вызывает calculateSum
 * Должна отображаться во входящих вызовах calculateSum
 */
export function processUser(a: number, b: number): number {
    const sum = calculateSum(a, b);
    return sum * 2;
}

/**
 * Эта функция также вызывает calculateSum
 * Должна отображаться во входящих вызовах calculateSum
 */
export function calculateTotal(items: number[]): number {
    let total = 0;
    for (const item of items) {
        total = calculateSum(total, item);
    }
    return total;
}

// ============================================================================
// CALLER'Ы ДЛЯ МЕТОДА UserService.getUserName
// ============================================================================

/**
 * Эта функция вызывает getUserName через экземпляр UserService
 * Должна отображаться во входящих вызовах getUserName
 */
export function displayUserInfo(user: UserService): string {
    const name = user.getUserName();
    return `User: ${name}`;
}

/**
 * Эта функция вызывает getUserName через импортированный экземпляр
 * Должна отображаться во входящих вызовах getUserName
 */
export function getUserNameFromInstance(): string {
    return userServiceInstance.getUserName();
}

// ============================================================================
// CALLER'Ы ДЛЯ РЕКУРСИВНОЙ ФУНКЦИИ factorial
// ============================================================================

/**
 * Эта функция вызывает factorial
 * Должна отображаться во входящих вызовах factorial
 */
export function testFactorial(): number {
    return factorial(5);
}

/**
 * Эта функция вызывает factorial с разными значениями
 * Должна отображаться во входящих вызовах factorial
 */
export function calculateCombinations(n: number, r: number): number {
    // C(n,r) = n! / (r! * (n-r)!)
    const numerator = factorial(n);
    const denominator = factorial(r) * factorial(n - r);
    return numerator / denominator;
}

// ============================================================================
// CALLER'Ы ДЛЯ СТАТИЧЕСКОГО МЕТОДА HelperUtil.formatString
// ============================================================================

/**
 * Эта функция вызывает HelperUtil.formatString
 * Должна отображаться во входящих вызовах formatString
 */
export function formatOutput(value: string): string {
    return HelperUtil.formatString(value);
}

/**
 * Эта функция вызывает HelperUtil.formatString в цепочке
 * Должна отображаться во входящих вызовах formatString
 */
export function formatAndLog(data: string): void {
    const formatted = HelperUtil.formatString(data);
    console.log(formatted);
}

// ============================================================================
// CALLER'Ы ДЛЯ АСИНХРОННОЙ ФУНКЦИИ fetchData
// ============================================================================

/**
 * Эта функция вызывает fetchData
 * Должна отображаться во входящих вызовах fetchData
 */
export async function loadData(url: string): Promise<string> {
    const data = await fetchData(url);
    return data;
}

/**
 * Эта функция вызывает fetchData с обработкой ошибок
 * Должна отображаться во входящих вызовах fetchData
 */
export async function loadMultipleData(urls: string[]): Promise<string[]> {
    const results: string[] = [];
    for (const url of urls) {
        try {
            const data = await fetchData(url);
            results.push(data);
        } catch (error) {
            results.push(`Error loading ${url}`);
        }
    }
    return results;
}

// ============================================================================
// CALLER'Ы ДЛЯ ФУНКЦИИ combineValues
// ============================================================================

/**
 * Эта функция вызывает combineValues
 * Должна отображаться во входящих вызовах combineValues
 */
export function mergeData<T, U>(first: T, second: U): { first: T; second: U } {
    return combineValues(first, second);
}

// ============================================================================
// CALLER'Ы ДЛЯ ChainHelper.step1
// ============================================================================

/**
 * Эта функция вызывает step1 через цепочку методов
 * Должна отображаться во входящих вызовах step1
 */
export function runChain(): string {
    const helper = new ChainHelper();
    return helper.step1().step2().step3();
}

// ============================================================================
// CALLER'Ы ДЛЯ DataContainer.computedValue (геттер)
// ============================================================================

/**
 * Эта функция обращается к computedValue
 * Должна отображаться во входящих вызовах computedValue
 */
export function readComputedValue(): number {
    const container = new DataContainer();
    container.value = 10;
    return container.computedValue;
}

/**
 * Эта функция также обращается к computedValue
 * Должна отображаться во входящих вызовах computedValue
 */
export function processComputedValue(): string {
    const container = new DataContainer();
    const value = container.computedValue;
    return `Computed: ${value}`;
}
