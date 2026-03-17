/**
 * Файл с определениями переменных для тестирования textDocument/definition
 */

// Экспортируемая переменная
export const definitionVariable: string = "definition value";

// Числовая константа
export const DEFINITION_CONSTANT = 999;

// Объект с типом
export interface Point {
    x: number;
    y: number;
}

export const origin: Point = { x: 0, y: 0 };

// Массив
export const numbers: number[] = [1, 2, 3, 4, 5];

// Кортеж
export const tuple: [string, number] = ["hello", 42];
