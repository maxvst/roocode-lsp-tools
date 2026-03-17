/**
 * ============================================================================
 * BROKEN TARGETS - Файл с намеренными ошибками для негативных тестов
 * LSP Method: callHierarchy/outgoingCalls
 * ============================================================================
 * 
 * Этот файл содержит функции с намеренными ошибками для проверки
 * отказоустойчивости LSP при поиске исходящих вызовов.
 */

// ============================================================================
// СЦЕНАРИЙ 1: Функция с синтаксической ошибкой
// ============================================================================

/**
 * NEGATIVE TEST CASE: Функция с синтаксической ошибкой в теле
 * Symbol: functionWithSyntaxError
 * Command: callHierarchy/outgoingCalls
 * Expected: ОШИБКА ПАРСИНГА
 * Reason: Пропущена закрывающая скобка в определении функции
 * 
 * Примечание: Раскомментируйте для тестирования - это сломает компиляцию файла
 */
// export function functionWithSyntaxError(: void {  // Ошибка: пропущена скобка параметра
//     console.log('broken syntax'
// }

// ============================================================================
// СЦЕНАРИЙ 2: Целевая функция в файле с ошибками парсинга
// ============================================================================

/**
 * NEGATIVE TEST CASE: Функция, вызываемая из сломанного контекста
 * Symbol: targetFunctionInBrokenContext
 * Command: callHierarchy/outgoingCalls
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Функция определена после синтаксической ошибки в файле
 */
export function targetFunctionInBrokenContext(): string {
    return 'This function is valid but may be affected by other errors in file';
}

// ============================================================================
// СЦЕНАРИЙ 3: Функция, экспортируемая из сломанного модуля
// ============================================================================

/**
 * NEGATIVE TEST CASE: Экспорт функции с ошибкой типа
 * Symbol: exportedFunctionWithTypeError
 * Command: callHierarchy/outgoingCalls
 * Expected: ОШИБКА ТИПА
 * Reason: Функция возвращает значение, не соответствующее объявленному типу
 */
export function exportedFunctionWithTypeError(): string {
    // @ts-ignore - намеренная ошибка: возврат числа вместо строки
    return 42 as any;
}

/**
 * NEGATIVE TEST CASE: Функция с вызовом несуществующего метода
 * Symbol: functionCallingNonExistent
 * Command: callHierarchy/outgoingCalls
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Вызывает метод, который не существует
 */
export function functionCallingNonExistent(): void {
    // @ts-ignore - намеренная ошибка: метод не существует
    nonExistentHelperFunction();
}

// ============================================================================
// СЦЕНАРИЙ 4: Функция с циклической зависимостью
// ============================================================================

/**
 * NEGATIVE TEST CASE: Функция A с циклической зависимостью
 * Symbol: brokenCircularA
 * Command: callHierarchy/outgoingCalls
 * Expected: Может привести к неполному результату или циклу
 * Reason: brokenCircularA вызывает brokenCircularB, которая вызывает brokenCircularA
 */
export function brokenCircularA(): void {
    brokenCircularB();
}

/**
 * NEGATIVE TEST CASE: Функция B с циклической зависимостью
 * Symbol: brokenCircularB
 * Command: callHierarchy/outgoingCalls
 * Expected: Может привести к неполному результату или циклу
 * Reason: brokenCircularB вызывает brokenCircularA, которая вызывает brokenCircularB
 */
export function brokenCircularB(): void {
    brokenCircularA();
}

// ============================================================================
// СЦЕНАРИЙ 5: Функция с вызовом через null/undefined
// ============================================================================

/**
 * NEGATIVE TEST CASE: Функция с вызовом метода на null
 * Symbol: callOnNullTarget
 * Command: callHierarchy/outgoingCalls
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Попытка вызвать метод на null значении
 */
export function callOnNullTarget(): void {
    // @ts-ignore - намеренная ошибка: вызов на null
    const nullValue: null = null;
    nullValue.nonExistentMethod();
}

/**
 * NEGATIVE TEST CASE: Функция с вызовом метода на undefined
 * Symbol: callOnUndefinedTarget
 * Command: callHierarchy/outgoingCalls
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Попытка вызвать метод на undefined значении
 */
export function callOnUndefinedTarget(): void {
    // @ts-ignore - намеренная ошибка: вызов на undefined
    const undefinedValue: undefined = undefined;
    undefinedValue.nonExistentMethod();
}

// ============================================================================
// СЦЕНАРИЙ 6: Функция с неправильной сигнатурой вызова
// ============================================================================

/**
 * NEGATIVE TEST CASE: Функция с вызовом и неправильными аргументами
 * Symbol: callWithWrongArguments
 * Command: callHierarchy/outgoingCalls
 * Expected: ОШИБКА ТИПА
 * Reason: Передача аргументов неправильного типа
 */
export function callWithWrongArguments(): void {
    // @ts-ignore - намеренная ошибка: неправильные типы аргументов
    targetFunctionWithString('expect number, got string');
}

/**
 * Вспомогательная функция, ожидающая число
 */
function targetFunctionWithString(num: number): void {
    console.log(num);
}

// ============================================================================
// СЦЕНАРИЙ 7: Функция с вызовом приватного метода извне
// ============================================================================

/**
 * NEGATIVE TEST CASE: Класс с вызовом приватного метода извне
 * Symbol: BrokenTargetClass
 * Command: callHierarchy/outgoingCalls
 * Expected: ОШИБКА ДОСТУПА
 * Reason: Попытка вызвать приватный метод из внешнего кода
 */
export class BrokenTargetClass {
    private privateTargetMethod(): void {
        console.log('private');
    }

    public callPrivateFromPublic(): void {
        this.privateTargetMethod(); // Это корректно
    }
}

/**
 * NEGATIVE TEST CASE: Функция, вызывающая приватный метод
 * Symbol: callPrivateMethodExternally
 * Command: callHierarchy/outgoingCalls
 * Expected: ОШИБКА ДОСТУПА
 * Reason: Приватный метод недоступен извне класса
 */
export function callPrivateMethodExternally(): void {
    const instance = new BrokenTargetClass();
    // @ts-ignore - намеренная ошибка: приватный метод недоступен
    instance.privateTargetMethod();
}

// ============================================================================
// СЦЕНАРИЙ 8: Функция с вызовом удалённого/переименованного символа
// ============================================================================

/**
 * NEGATIVE TEST CASE: Вызов переименованной функции
 * Symbol: callRenamedTarget
 * Command: callHierarchy/outgoingCalls
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Функция была переименована, старое имя не существует
 */
export function callRenamedTarget(): void {
    // @ts-ignore - намеренная ошибка: функция была переименована
    oldTargetFunctionName();
}

// ============================================================================
// СЦЕНАРИЙ 9: Функция с бесконечной рекурсией
// ============================================================================

/**
 * NEGATIVE TEST CASE: Функция с бесконечной рекурсией
 * Symbol: infiniteRecursiveTarget
 * Command: callHierarchy/outgoingCalls
 * Expected: Может привести к зависанию или ошибке
 * Reason: Нет базового случая рекурсии
 */
export function infiniteRecursiveTarget(n: number): number {
    // Ошибка: нет базового случая
    return infiniteRecursiveTarget(n + 1);
}

// ============================================================================
// СЦЕНАРИЙ 10: Функция с вызовом из try-catch с ошибкой
// ============================================================================

/**
 * NEGATIVE TEST CASE: Функция с вызовом в try-catch, который всегда падает
 * Symbol: alwaysFailingCall
 * Command: callHierarchy/outgoingCalls
 * Expected: LSP может найти вызов, но он всегда приводит к ошибке
 * Reason: Вызываемая функция всегда выбрасывает исключение
 */
export function alwaysFailingCall(): void {
    try {
        functionThatAlwaysThrows();
    } catch (e) {
        console.log('Caught error');
    }
}

/**
 * Функция, которая всегда выбрасывает ошибку
 */
function functionThatAlwaysThrows(): never {
    throw new Error('Always fails');
}

// ============================================================================
// СЦЕНАРИЙ 11: Функция с вызовом через несуществующий интерфейс
// ============================================================================

/**
 * NEGATIVE TEST CASE: Вызов через несуществующий интерфейс
 * Symbol: callThroughMissingInterface
 * Command: callHierarchy/outgoingCalls
 * Expected: ОШИБКА ТИПА
 * Reason: Объект не реализует ожидаемый интерфейс
 */
export function callThroughMissingInterface(): void {
    // @ts-ignore - намеренная ошибка: объект не имеет метода
    const obj: { requiredMethod: () => void } = {} as any;
    obj.requiredMethod();
}

// ============================================================================
// СЦЕНАРИЙ 12: Функция с вызовом в асинхронном контексте с ошибкой
// ============================================================================

/**
 * NEGATIVE TEST CASE: Асинхронная функция с вызовом синхронной функции
 * Symbol: asyncCallingSyncWithWrongType
 * Command: callHierarchy/outgoingCalls
 * Expected: ОШИБКА ТИПА
 * Reason: Неправильное использование await с не-Promise значением
 */
export async function asyncCallingSyncWithWrongType(): Promise<void> {
    // @ts-ignore - намеренная ошибка: await на не-Promise
    const result = await synchronousFunction();
    return result;
}

function synchronousFunction(): string {
    return 'not a promise';
}

// ============================================================================
// СЦЕНАРИЙ 13: Функция с вызовом деструктурированной несуществующей функции
// ============================================================================

/**
 * NEGATIVE TEST CASE: Вызов деструктурированной несуществующей функции
 * Symbol: callDestructuredNonExistent
 * Command: callHierarchy/outgoingCalls
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Попытка вызвать функцию, которая не существует в деструктурированном объекте
 */
export function callDestructuredNonExistent(): void {
    // @ts-ignore - намеренная ошибка: функция не существует в объекте
    const { nonExistentFunction } = { existingFunction: () => {} };
    nonExistentFunction();
}

// ============================================================================
// СЦЕНАРИЙ 14: Функция с вызовом метода на примитиве
// ============================================================================

/**
 * NEGATIVE TEST CASE: Вызов несуществующего метода на строке
 * Symbol: callNonExistentStringMethod
 * Command: callHierarchy/outgoingCalls
 * Expected: ОШИБКА ТИПА
 * Reason: Строка не имеет такого метода
 */
export function callNonExistentStringMethod(): void {
    const str = 'test';
    // @ts-ignore - намеренная ошибка: метод не существует на String
    (str as any).nonExistentMethod();
}

/**
 * NEGATIVE TEST CASE: Вызов несуществующего метода на числе
 * Symbol: callNonExistentNumberMethod
 * Command: callHierarchy/outgoingCalls
 * Expected: ОШИБКА ТИПА
 * Reason: Число не имеет такого метода
 */
export function callNonExistentNumberMethod(): void {
    const num = 42;
    // @ts-ignore - намеренная ошибка: метод не существует на Number
    (num as any).nonExistentMethod();
}

// ============================================================================
// ЭКСПОРТЫ ДЛЯ ТЕСТИРОВАНИЯ
// ============================================================================

export const brokenTargetsTestCases = {
    targetFunctionInBrokenContext,
    exportedFunctionWithTypeError,
    functionCallingNonExistent,
    brokenCircularA,
    brokenCircularB,
    callOnNullTarget,
    callOnUndefinedTarget,
    callWithWrongArguments,
    callPrivateMethodExternally,
    callRenamedTarget,
    infiniteRecursiveTarget,
    alwaysFailingCall,
    callThroughMissingInterface,
    asyncCallingSyncWithWrongType,
    callDestructuredNonExistent,
    callNonExistentStringMethod,
    callNonExistentNumberMethod,
    BrokenTargetClass
};
