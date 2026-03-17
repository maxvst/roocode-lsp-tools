/**
 * ============================================================================
 * Файл зависимостей для тестирования callHierarchy/outgoingCalls
 * Description: Функции-цели, которые вызываются из тестируемых функций
 * ============================================================================
 * 
 * Этот файл содержит функции, которые импортируются и вызываются
 * из outgoingCalls.ts для тестирования поиска исходящих вызовов.
 */

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (HELPER FUNCTIONS)
// ============================================================================

/**
 * Вспомогательная функция A
 * Вызывается из mainProcessor, conditionalProcessor и других функций
 */
export function helperFunctionA(input: string): string {
    return `A:${input}`;
}

/**
 * Вспомогательная функция B
 * Вызывается из mainProcessor, conditionalProcessor и других функций
 */
export function helperFunctionB(input: string): string {
    return `B:${input}`;
}

/**
 * Вспомогательная функция C
 * Вызывается из mainProcessor и других функций
 */
export function helperFunctionC(input: string): string {
    return `C:${input}`;
}

// ============================================================================
// УТИЛИТЫ
// ============================================================================

/**
 * Утилита для логирования
 * Вызывается из различных функций для логирования
 */
export function utilityLog(message: string): void {
    console.log(`[LOG] ${message}`);
}

/**
 * Утилита для форматирования
 * Вызывается для форматирования результатов
 */
export function utilityFormat(input: string): string {
    return `[${input}]`;
}

/**
 * Утилита для валидации входных данных
 * Вызывается перед обработкой данных
 */
export function validateInput(input: string): boolean {
    return input !== null && input !== undefined && input.length > 0;
}

/**
 * Утилита для обработки данных
 * Вызывается для преобразования данных
 */
export function processData(input: string): string {
    return `processed:${input}`;
}

// ============================================================================
// ФУНКЦИИ ДЛЯ ЦЕПОЧЕК ВЫЗОВОВ
// ============================================================================

/**
 * Первый шаг цепочки
 * Используется в chainCaller
 */
export function chainFirst(value: number): number {
    return value + 10;
}

/**
 * Второй шаг цепочки
 * Используется в chainCaller
 */
export function chainSecond(value: number): number {
    return value * 2;
}

/**
 * Третий шаг цепочки
 * Используется в chainCaller
 */
export function chainThird(value: number): number {
    return value - 5;
}

// ============================================================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С ДАННЫМИ
// ============================================================================

/**
 * Функция для получения данных
 */
export function fetchData(source: string): string {
    return `Data from ${source}`;
}

/**
 * Функция для сохранения данных
 */
export function saveData(data: string): boolean {
    console.log(`Saving: ${data}`);
    return true;
}

/**
 * Функция для удаления данных
 */
export function deleteData(id: string): boolean {
    console.log(`Deleting: ${id}`);
    return true;
}

// ============================================================================
// ФУНКЦИИ ДЛЯ АСИНХРОННОЙ ОБРАБОТКИ
// ============================================================================

/**
 * Асинхронная функция для получения удалённых данных
 */
export async function fetchRemote(url: string): Promise<string> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`Remote data from ${url}`);
        }, 100);
    });
}

/**
 * Асинхронная функция для отправки данных
 */
export async function sendRemote(url: string, data: string): Promise<boolean> {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Sending ${data} to ${url}`);
            resolve(true);
        }, 100);
    });
}

// ============================================================================
// ФУНКЦИИ ПРЕОБРАЗОВАНИЯ
// ============================================================================

/**
 * Преобразование строки в верхний регистр
 */
export function toUpperCase(input: string): string {
    return input.toUpperCase();
}

/**
 * Преобразование строки в нижний регистр
 */
export function toLowerCase(input: string): string {
    return input.toLowerCase();
}

/**
 * Обрезка строки
 */
export function trimString(input: string): string {
    return input.trim();
}

/**
 * Разделение строки
 */
export function splitString(input: string, separator: string): string[] {
    return input.split(separator);
}

// ============================================================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С МАССИВАМИ
// ============================================================================

/**
 * Фильтрация массива
 */
export function filterArray<T>(items: T[], predicate: (item: T) => boolean): T[] {
    return items.filter(predicate);
}

/**
 * Сортировка массива
 */
export function sortArray<T>(items: T[], compareFn: (a: T, b: T) => number): T[] {
    return [...items].sort(compareFn);
}

/**
 * Преобразование массива
 */
export function mapArray<T, U>(items: T[], mapper: (item: T) => U): U[] {
    return items.map(mapper);
}

// ============================================================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С ОБЪЕКТАМИ
// ============================================================================

/**
 * Получение ключей объекта
 */
export function getObjectKeys<T extends Record<string, unknown>>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
}

/**
 * Получение значений объекта
 */
export function getObjectValues<T extends Record<string, unknown>>(obj: T): unknown[] {
    return Object.values(obj);
}

/**
 * Слияние объектов
 */
export function mergeObjects<T extends Record<string, unknown>, U extends Record<string, unknown>>(
    obj1: T,
    obj2: U
): T & U {
    return { ...obj1, ...obj2 };
}

// ============================================================================
// ЭКСПОРТ СОСТОЯНИЯ
// ============================================================================

/**
 * Текущее состояние системы
 */
export const systemState = {
    initialized: false,
    lastUpdate: null as string | null,
    errorCount: 0
};

/**
 * Инициализация состояния
 */
export function initializeState(): void {
    systemState.initialized = true;
    systemState.lastUpdate = new Date().toISOString();
    systemState.errorCount = 0;
}

/**
 * Сброс состояния
 */
export function resetState(): void {
    systemState.initialized = false;
    systemState.lastUpdate = null;
    systemState.errorCount = 0;
}
