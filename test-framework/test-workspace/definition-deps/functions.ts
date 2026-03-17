/**
 * Файл с определениями функций для тестирования textDocument/definition
 */

// Базовая функция
export function definitionFunction(name: string): string {
    return `Hello, ${name}!`;
}

// Функция с несколькими параметрами
export function calculateArea(width: number, height: number): number {
    return width * height;
}

// Функция с rest-параметрами
export function sum(...numbers: number[]): number {
    return numbers.reduce((acc, n) => acc + n, 0);
}

// Функция высшего порядка
export function createMultiplier(factor: number): (n: number) => number {
    return (n: number) => n * factor;
}

// Перегруженная функция (function overload)
export function process(input: string): string;
export function process(input: number): number;
export function process(input: string | number): string | number {
    if (typeof input === "string") {
        return input.toUpperCase();
    }
    return input * 2;
}

// Функция с callback
export function withCallback(
    value: string,
    callback: (result: string) => void
): void {
    callback(value);
}

// Экспорт функции через переменную
export const exportedMethod = (data: unknown): boolean => {
    return data !== null && data !== undefined;
};
