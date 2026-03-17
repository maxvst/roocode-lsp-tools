/**
 * ============================================================================
 * BROKEN CALLERS - Файл с намеренными ошибками для негативных тестов
 * LSP Method: callHierarchy/incomingCalls
 * ============================================================================
 * 
 * Этот файл содержит функции с намеренными ошибками для проверки
 * отказоустойчивости LSP при поиске входящих вызовов.
 */

// Импорт целевых функций (некоторые из них существуют, некоторые - нет)
import { calculateSum } from '../incomingCalls';

// ============================================================================
// СЦЕНАРИЙ 1: Функция, вызывающая несуществующую цель
// ============================================================================

/**
 * NEGATIVE TEST CASE: Вызов несуществующей целевой функции
 * Symbol: callNonExistentTarget
 * Command: callHierarchy/incomingCalls на nonExistentTargetFunction
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Целевая функция nonExistentTargetFunction не определена нигде
 */
export function callNonExistentTarget(): void {
    // @ts-ignore - намеренная ошибка: функция не существует
    nonExistentTargetFunction();
}

// ============================================================================
// СЦЕНАРИЙ 2: Циклические вызовы (A вызывает B, B вызывает A)
// ============================================================================

/**
 * NEGATIVE TEST CASE: Циклический вызов - функция A
 * Symbol: circularCallerA
 * Command: callHierarchy/incomingCalls
 * Expected: Может вызвать бесконечный цикл или неполный результат
 * Reason: circularCallerA вызывает circularCallerB, которая вызывает circularCallerA
 */
export function circularCallerA(): void {
    console.log('A calls B');
    circularCallerB();
}

/**
 * NEGATIVE TEST CASE: Циклический вызов - функция B
 * Symbol: circularCallerB
 * Command: callHierarchy/incomingCalls
 * Expected: Может вызвать бесконечный цикл или неполный результат
 * Reason: circularCallerB вызывает circularCallerA, которая вызывает circularCallerB
 */
export function circularCallerB(): void {
    console.log('B calls A');
    circularCallerA();
}

// ============================================================================
// СЦЕНАРИЙ 3: Вызов функции из сломанного модуля
// ============================================================================

/**
 * NEGATIVE TEST CASE: Вызов функции с синтаксической ошибкой в теле
 * Symbol: callBrokenFunction
 * Command: callHierarchy/incomingCalls на brokenTargetFunction
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Целевая функция содержит синтаксическую ошибку
 */
export function callBrokenFunction(): void {
    // Эта функция пытается вызвать функцию с ошибкой
    // @ts-ignore - намеренная ошибка
    brokenTargetFunction();
}

/**
 * Сломанная целевая функция с синтаксической ошибкой
 * (раскомментируйте для тестирования - это сломает компиляцию)
 */
// export function brokenTargetFunction(: void {  // Синтаксическая ошибка: пропущена скобка
//     console.log('broken'
// }

// ============================================================================
// СЦЕНАРИЙ 4: Вызов с неправильной сигнатурой
// ============================================================================

/**
 * NEGATIVE TEST CASE: Вызов с неправильным количеством аргументов
 * Symbol: callWithWrongArity
 * Command: callHierarchy/incomingCalls на calculateSum
 * Expected: LSP может найти вызов, но он семантически неверен
 * Reason: calculateSum ожидает 2 аргумента, передан 1
 */
export function callWithWrongArity(): void {
    // @ts-ignore - намеренная ошибка: неправильное количество аргументов
    calculateSum(1);
}

/**
 * NEGATIVE TEST CASE: Вызов с аргументами неправильного типа
 * Symbol: callWithWrongTypes
 * Command: callHierarchy/incomingCalls на calculateSum
 * Expected: LSP может найти вызов, но он семантически неверен
 * Reason: calculateSum ожидает числа, переданы строки
 */
export function callWithWrongTypes(): void {
    // @ts-ignore - намеренная ошибка: неправильные типы аргументов
    calculateSum('one', 'two');
}

// ============================================================================
// СЦЕНАРИЙ 5: Вызов через несуществующую цепочку
// ============================================================================

/**
 * NEGATIVE TEST CASE: Вызов через несуществующую цепочку объектов
 * Symbol: callThroughBrokenChain
 * Command: callHierarchy/incomingCalls
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Промежуточный объект в цепочке не существует
 */
export function callThroughBrokenChain(): void {
    // @ts-ignore - намеренная ошибка: цепочка разорвана
    nonExistent.chain.method();
}

// ============================================================================
// СЦЕНАРИЙ 6: Вызов метода удалённого/переименованного символа
// ============================================================================

/**
 * NEGATIVE TEST CASE: Вызов переименованной функции
 * Symbol: callRenamedFunction
 * Command: callHierarchy/incomingCalls
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Функция была переименована, старое имя не существует
 */
export function callRenamedFunction(): void {
    // @ts-ignore - намеренная ошибка: функция была переименована
    oldFunctionNameThatWasRenamed();
}

// ============================================================================
// СЦЕНАРИЙ 7: Вызов функции из модуля с ошибками парсинга
// ============================================================================

/**
 * NEGATIVE TEST CASE: Импорт из модуля с ошибками
 * Symbol: callFromBrokenModule
 * Command: callHierarchy/incomingCalls
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Модуль содержит ошибки парсинга и не может быть загружен
 */
// Раскомментируйте для тестирования (сломает компиляцию):
// import { functionFromBrokenModule } from './this-file-does-not-exist';
// export function callFromBrokenModule(): void {
//     functionFromBrokenModule();
// }

// ============================================================================
// СЦЕНАРИЙ 8: Глубокая рекурсия с ошибкой
// ============================================================================

/**
 * NEGATIVE TEST CASE: Глубокая рекурсия с ошибкой в базовом случае
 * Symbol: brokenRecursion
 * Command: callHierarchy/incomingCalls
 * Expected: Может привести к переполнению стека при выполнении
 * Reason: Отсутствует корректный базовый случай рекурсии
 */
export function brokenRecursion(n: number): number {
    // Ошибка: нет базового случая, рекурсия бесконечная
    return brokenRecursion(n + 1);
}

// ============================================================================
// СЦЕНАРИЙ 9: Вызов функции в удалённом файле
// ============================================================================

/**
 * NEGATIVE TEST CASE: Вызов функции из удалённого файла
 * Symbol: callFromDeletedFile
 * Command: callHierarchy/incomingCalls
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Файл, содержащий целевую функцию, был удалён
 */
// Раскомментируйте для тестирования:
// import { functionFromDeletedFile } from './deleted-file';
// export function callFromDeletedFile(): void {
//     functionFromDeletedFile();
// }

// ============================================================================
// СЦЕНАРИЙ 10: Вызов с this в неправильном контексте
// ============================================================================

/**
 * NEGATIVE TEST CASE: Вызов метода с потерянным контекстом this
 * Symbol: callWithLostContext
 * Command: callHierarchy/incomingCalls
 * Expected: Ошибка времени выполнения
 * Reason: this указывает на undefined вместо объекта
 */
export function callWithLostContext(): void {
    const obj = {
        method(): string {
            return this.value; // Ошибка: this может быть undefined
        }
    };
    
    // @ts-ignore - намеренная ошибка: потеря контекста this
    const extractedMethod = obj.method;
    extractedMethod();
}

// ============================================================================
// ЭКСПОРТЫ ДЛЯ ТЕСТИРОВАНИЯ
// ============================================================================

export const brokenCallersTestCases = {
    circularCallerA,
    circularCallerB,
    callNonExistentTarget,
    callWithWrongArity,
    callWithWrongTypes,
    brokenRecursion
};
