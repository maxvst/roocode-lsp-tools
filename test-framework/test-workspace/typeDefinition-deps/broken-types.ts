/**
 * ============================================================================
 * Файл с намеренно некорректными определениями типов для негативных тестов
 * ============================================================================
 * 
 * Этот файл содержит типы с ошибками и некорректными определениями.
 * Используется для проверки поведения LSP при работе с некорректными типами.
 */

/**
 * Некорректный тип: циклическая ссылка без ограничения
 * Symbol: InfiniteRecursiveType
 * Command: textDocument/typeDefinition
 * Expected: ОШИБКА - бесконечная рекурсия в типе
 */
export interface InfiniteRecursiveType {
    nested: InfiniteRecursiveType;
    // Этот тип создаёт бесконечную вложенность
}

/**
 * Некорректный тип: конфликтующий type alias
 * Symbol: ConflictingType
 * Command: textDocument/typeDefinition
 * Expected: ОШИБКА - повторное объявление типа
 */
export type ConflictingType = string;
// Раскомментируйте следующую строку для создания ошибки:
// export type ConflictingType = number; // Ошибка: повторное объявление

/**
 * Некорректный тип: generic с неправильными ограничениями
 * Symbol: WrongGenericConstraint
 * Command: textDocument/typeDefinition
 * Expected: ОШИБКА - неверное ограничение generic типа
 */
// Раскомментируйте для создания ошибки:
// export type WrongGenericConstraint<T extends NonExistentType> = T;

/**
 * Некорректный тип: условный тип с ошибкой
 * Symbol: BrokenConditionalType
 * Command: textDocument/typeDefinition
 * Expected: ОШИБКА - условный тип ссылается на несуществующий тип
 */
// Раскомментируйте для создания ошибки:
// export type BrokenConditionalType<T> = T extends NonExistentType ? string : number;

/**
 * Некорректный тип: mapped type с ошибкой
 * Symbol: BrokenMappedType
 * Command: textDocument/typeDefinition
 * Expected: ОШИБКА - mapped type ссылается на несуществующий тип
 */
// Раскомментируйте для создания ошибки:
// export type BrokenMappedType = { [K in keyof NonExistentType]: NonExistentType[K] };

/**
 * Тип с намеренно противоречивыми свойствами
 * Symbol: ContradictoryType
 * Command: textDocument/typeDefinition
 * Expected: УСПЕХ - тип определён, но использование приведёт к ошибкам
 */
export interface ContradictoryType {
    // Свойство одновременно должно быть строкой и числом - невозможно
    value: string & number; // never type
}

/**
 * Тип с некорректным индексным доступом
 * Symbol: BrokenIndexedAccess
 * Command: textDocument/typeDefinition
 * Expected: ОШИБКА - индексный доступ к несуществующему свойству
 */
export type BrokenIndexedAccess = { a: string }['b']; // Ошибка: свойство 'b' не существует

/**
 * Экспорт типа с ошибкой в определении
 * Symbol: BrokenType
 * Command: textDocument/typeDefinition
 * Expected: ЧАСТИЧНЫЙ УСПЕХ - тип экспортирован, но содержит ошибку
 */
export type BrokenType = {
    // Незавершённое определение типа
    // @ts-ignore
    value: NonExistentType;
};

/**
 * Тип с некорректным union
 * Symbol: BrokenUnionType
 * Command: textDocument/typeDefinition
 * Expected: ОШИБКА - один из членов union не существует
 */
// Раскомментируйте для создания ошибки:
// export type BrokenUnionType = string | number | NonExistentType;

/**
 * Тип с некорректным intersection
 * Symbol: BrokenIntersectionType
 * Command: textDocument/typeDefinition
 * Expected: ОШИБКА - один из членов intersection не существует
 */
// Раскомментируйте для создания ошибки:
// export type BrokenIntersectionType = { a: string } & NonExistentType;

/**
 * Примечание: Некоторые типы закомментированы, чтобы файл мог компилироваться.
 * Для тестирования конкретных ошибок раскомментируйте соответствующие определения.
 */
