/**
 * ============================================================================
 * BROKEN INTERFACES FOR NEGATIVE TEST CASES
 * LSP Method: textDocument/implementation
 * ============================================================================
 * 
 * Этот файл содержит намеренно сломанные интерфейсы и классы для тестирования
 * отказоустойчивости LSP при работе с невалидным кодом.
 * 
 * ВНИМАНИЕ: Этот файл содержит код с намеренными ошибками!
 * Не используйте эти паттерны в production коде.
 */

// ============================================================================
// ИНТЕРФЕЙС С КОНФЛИКТУЮЩИМИ ТИПАМИ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Интерфейс с конфликтующими типами методов
 * Symbol: IConflictingTypes
 * Description: Интерфейс, методы которого имеют несовместимые сигнатуры
 * Reason: Методы getValue() возвращают разные типы, что делает невозможным
 *         создание класса, который корректно реализует оба метода
 */
export interface IConflictingTypes {
    getValue(): string;
    getValue(): number; // Конфликт: тот же метод, но другой возвращаемый тип
    
    // Примечание: TypeScript может не показать ошибку здесь,
    // но реализация будет невозможна
}

// ============================================================================
// АБСТРАКТНЫЙ КЛАСС С ОШИБКАМИ В НАСЛЕДНИКАХ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Абстрактный класс с ошибками в наследниках
 * Symbol: BrokenAbstractClass
 * Description: Абстрактный класс, который имеет наследника с некорректной реализацией
 */
export abstract class BrokenAbstractClass {
    abstract processData(input: string): number;
    
    // Метод, который использует абстрактный метод
    calculate(input: string): number {
        return this.processData(input) * 2;
    }
}

/**
 * NEGATIVE TEST CASE: Наследник с неправильной реализацией
 * Symbol: BrokenChildClass
 * Description: Класс наследует BrokenAbstractClass, но с ошибками в реализации
 * Reason: Метод processData не соответствует ожидаемому поведению базового класса
 */
export class BrokenChildClass extends BrokenAbstractClass {
    // @ts-expect-error - неправильная сигнатура (должен быть string -> number)
    processData(input: number): string {
        // Ошибка: сигнатура не совпадает с абстрактным методом
        return input.toString();
    }
}

// ============================================================================
// ИНТЕРФЕЙС С НЕСООТВЕТСТВУЮЩЕЙ СИГНАТУРОЙ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Интерфейс для проверки несоответствия сигнатур
 * Symbol: ISignatureMismatch
 * Description: Интерфейс с чётко определённой сигнатурой для тестирования
 *              классов с неправильной реализацией
 */
export interface ISignatureMismatch {
    process(input: string): number;
    transform(data: number[]): string;
}

// ============================================================================
// ИНТЕРФЕЙС, РАСШИРЯЮЩИЙ НЕСУЩЕСТВУЮЩИЙ ИНТЕРФЕЙС
// ============================================================================

/**
 * NEGATIVE TEST CASE: Интерфейс, расширяющий несуществующий интерфейс
 * Symbol: IExtendsNonExistent
 * Description: Интерфейс пытается расширить интерфейс, который не существует
 * Reason: INonExistentBaseInterface нигде не объявлен в проекте
 */
// @ts-expect-error - базовый интерфейс не существует
export interface IExtendsNonExistent extends INonExistentBaseInterface {
    ownMethod(): void;
}

// ============================================================================
// ИНТЕРФЕЙС С ПРОПУЩЕННЫМИ МЕТОДАМИ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Интерфейс для проверки неполной реализации
 * Symbol: IIncompleteInterface
 * Description: Интерфейс с несколькими методами для тестирования классов,
 *              которые не реализуют все обязательные методы
 */
export interface IIncompleteInterface {
    methodA(): void;
    methodB(): void;
    methodC(): string;
}

// ============================================================================
// ЦИКЛИЧЕСКИЕ ЗАВИСИМОСТИ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Циклическая зависимость между интерфейсами
 * Symbol: ICircularA
 * Description: Интерфейс A требует методы из интерфейса B, который требует A
 */
export interface ICircularA extends ICircularB {
    methodFromA(): void;
}

/**
 * NEGATIVE TEST CASE: Вторая часть циклической зависимости
 * Symbol: ICircularB
 * Description: Интерфейс B требует методы из интерфейса A
 * Reason: Это создаёт циклическую зависимость A -> B -> A
 */
export interface ICircularB {
    methodFromB(): void;
    // Расширение ICircularA создаст цикл
}

// Примечание: реальный цикл создаётся когда ICircularB extends ICircularA
// Но TypeScript не позволяет это напрямую, поэтому демонстрируем через структуру

// ============================================================================
// GENERIC ИНТЕРФЕЙС С НЕСОВМЕСТИМЫМИ ТИПАМИ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Generic интерфейс с потенциально несовместимыми типами
 * Symbol: IGenericMismatch<T, U>
 * Description: Интерфейс, где типы T и U могут быть несовместимы
 */
export interface IGenericMismatch<T, U> {
    transform(input: T): U;
    reverse(output: U): T;
}

/**
 * NEGATIVE TEST CASE: Реализация с несовместимыми типами
 * Symbol: BrokenGenericImplementation
 * Description: Попытка реализовать generic интерфейс с несовместимыми типами
 */
// @ts-expect-error - string и number несовместимы для round-trip преобразования
export class BrokenGenericImplementation implements IGenericMismatch<string, number> {
    transform(input: string): number {
        return parseFloat(input);
    }
    
    reverse(output: number): string {
        // Проблема: "42" -> 42 -> "42" работает, но "42.5" -> 42.5 -> "42.5" может не совпасть
        // с оригиналом из-за точности чисел
        return output.toString();
    }
}

// ============================================================================
// ИНТЕРФЕЙС С НЕВОЗМОЖНЫМИ ТИПАМИ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Интерфейс с never типом
 * Symbol: IImpossibleType
 * Description: Интерфейс, использующий тип never, который невозможно реализовать
 */
export interface IImpossibleType {
    impossibleMethod(): never;
    anotherImpossible(): string & number; // intersection невозможных типов
}

/**
 * NEGATIVE TEST CASE: Попытка реализации невозможного интерфейса
 * Symbol: ImpossibleImplementation
 * Description: Класс пытается реализовать интерфейс с never типом
 */
export class ImpossibleImplementation implements IImpossibleType {
    impossibleMethod(): never {
        // Метод должен никогда не возвращаться
        throw new Error('This method can never return normally');
    }
    
    // @ts-expect-error - string & number невозможно
    anotherImpossible(): string & number {
        throw new Error('Impossible type');
    }
}

// ============================================================================
// АБСТРАКТНЫЙ КЛАСС С НЕРЕАЛИЗУЕМЫМИ МЕТОДАМИ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Абстрактный класс с нереализуемыми требованиями
 * Symbol: AbstractWithImpossibleRequirements
 * Description: Абстрактный класс, требующий реализации невозможного метода
 */
export abstract class AbstractWithImpossibleRequirements {
    // Требует метод, который возвращает never
    abstract getNever(): never;
    
    // Требует метод с конфликтующими типами
    abstract getConflicting(): string & number;
}

// ============================================================================
// ЭКСПОРТ ДЛЯ ИСПОЛЬЗОВАНИЯ В ТЕСТАХ
// ============================================================================

export {
    IConflictingTypes as IBrokenInterface,
};
