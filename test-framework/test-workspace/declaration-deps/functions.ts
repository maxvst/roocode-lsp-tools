/**
 * Файл с объявлениями функций для тестирования textDocument/declaration
 */

// Простая функция без параметров
export function simpleFunction(): string {
    return "Hello from simple function";
}

// Функция с параметрами
export function add(a: number, b: number): number {
    return a + b;
}

// Функция с необязательным параметром
export function greet(name: string, greeting?: string): string {
    return `${greeting || "Hello"}, ${name}!`;
}

// Стрелочная функция
export const arrowFunction = (x: number): number => x * 2;

// Асинхронная функция
export async function asyncFunction(): Promise<string> {
    return "async result";
}

// Обобщённая функция
export function identity<T>(arg: T): T {
    return arg;
}

// Функция с параметром по умолчанию
export function withDefault(name: string = "World"): string {
    return `Hello, ${name}!`;
}
