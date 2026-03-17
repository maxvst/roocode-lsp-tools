/**
 * Файл с объявлениями переменных для тестирования textDocument/declaration
 */

// Экспортируемая переменная с явным типом
export const exportedVariable: string = "exported value";

// Переменная с выведенным типом
export const inferredVariable = 42;

// Константа
export const MAX_SIZE = 100;

// Переменная с объектным типом
export const config = {
    debug: true,
    version: "1.0.0",
    name: "test-config"
};
