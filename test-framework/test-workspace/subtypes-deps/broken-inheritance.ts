/**
 * ============================================================================
 * BROKEN INHERITANCE TYPES
 * Description: Типы с намеренными ошибками наследования для тестирования LSP subtypes
 * ============================================================================
 * 
 * Этот файл содержит типы с различными нарушениями в наследовании и реализации.
 * Используется для проверки того, как LSP обрабатывает некорректный код при поиске подтипов.
 */

// ============================================================================
// НАСЛЕДНИК С НЕПРАВИЛЬНОЙ СИГНАТУРОЙ МЕТОДА
// ============================================================================

/**
 * Базовый класс с определённой сигнатурой метода
 */
export abstract class BaseWithSignature {
  protected name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  /**
   * Метод должен принимать string и возвращать number
   */
  public abstract process(input: string): number;
  
  public getName(): string {
    return this.name;
  }
}

/**
 * NEGATIVE TEST CASE: Наследник с неправильной сигнатурой метода
 * Symbol: WrongSignatureChild
 * Command: typeHierarchy/subtypes
 * Expected: ОШИБКА компиляции
 * Reason: Сигнатура метода process не соответствует базовому классу
 *          (ожидается (string) => number, предоставлено (number) => string).
 */
// @ts-expect-error - неправильная сигнатура метода
export class WrongSignatureChild extends BaseWithSignature {
  public process(input: number): string {
    return String(input * 2);
  }
  
  public extraMethod(): void {
    console.log('Extra method in wrong signature child');
  }
}

// ============================================================================
// НЕПОЛНАЯ РЕАЛИЗАЦИЯ ИНТЕРФЕЙСА
// ============================================================================

/**
 * Полный интерфейс с несколькими методами
 */
export interface ICompleteInterface {
  methodA(): void;
  methodB(param: string): number;
  methodC(flag: boolean): string;
  property: string;
}

/**
 * NEGATIVE TEST CASE: Реализация интерфейса с пропущенными методами
 * Symbol: IncompleteImplementation
 * Command: typeHierarchy/subtypes
 * Expected: ОШИБКА компиляции
 * Reason: Класс не реализует все методы интерфейса ICompleteInterface
 *          (отсутствуют methodB, methodC, property).
 */
// @ts-expect-error - неполная реализация интерфейса
export class IncompleteImplementation implements ICompleteInterface {
  public methodA(): void {
    console.log('Only methodA implemented');
  }
  
  // methodB не реализован
  // methodC не реализован
  // property не реализована
}

/**
 * NEGATIVE TEST CASE: Частичная реализация с неправильными типами
 * Symbol: WrongTypeImplementation
 * Command: typeHierarchy/subtypes
 * Expected: ОШИБКА компиляции
 * Reason: Реализованные методы имеют неправильные типы возвращаемых значений.
 */
// @ts-expect-error - неправильные типы в реализации
export class WrongTypeImplementation implements ICompleteInterface {
  public methodA(): string {  // Должен возвращать void
    return 'wrong return type';
  }
  
  public methodB(param: string): string {  // Должен возвращать number
    return param;
  }
  
  public methodC(flag: boolean): number {  // Должен возвращать string
    return flag ? 1 : 0;
  }
  
  public property: number = 42;  // Должен быть string
}

// ============================================================================
// FINAL-ПОДОБНЫЙ КЛАСС (ЭМУЛЯЦИЯ ЧЕРЕЗ ПРИВАТНЫЙ КОНСТРУКТОР)
// ============================================================================

/**
 * NEGATIVE TEST CASE: Класс, спроектированный как final
 * Symbol: FinalLikeClass
 * Command: typeHierarchy/subtypes
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА при попытке наследования
 * Reason: Приватный конструктор предотвращает создание подклассов вне тела класса.
 */
export class FinalLikeClass {
  private static _instances: FinalLikeClass[] = [];
  
  private constructor(
    private readonly id: string,
    private readonly value: number
  ) {}
  
  public static create(id: string, value: number): FinalLikeClass {
    const instance = new FinalLikeClass(id, value);
    FinalLikeClass._instances.push(instance);
    return instance;
  }
  
  public getId(): string {
    return this.id;
  }
  
  public getValue(): number {
    return this.value;
  }
  
  public static getAllInstances(): FinalLikeClass[] {
    return [...FinalLikeClass._instances];
  }
}

/**
 * NEGATIVE TEST CASE: Попытка наследования от final-подобного класса
 * Symbol: AttemptedFinalInheritance
 * Command: typeHierarchy/subtypes
 * Expected: ОШИБКА компиляции
 * Reason: Конструктор FinalLikeClass приватный, наследование невозможно.
 */
// @ts-expect-error - наследование невозможно из-за приватного конструктора
export class AttemptedFinalInheritance extends FinalLikeClass {
  public extraProperty: string = 'extra';
}

// ============================================================================
// СЛОМАННАЯ ЦЕПОЧКА НАСЛЕДОВАНИЯ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Родительский класс с ошибкой
 * Symbol: BrokenParentClass
 * Command: typeHierarchy/subtypes
 * Expected: ОШИБКА
 * Reason: Базовый класс наследуется от несуществующего типа.
 */
// @ts-expect-error - несуществующий базовый тип
export class BrokenParentClass extends NonExistentParentBase {
  public name: string = 'broken parent';
  
  public getName(): string {
    return this.name;
  }
}

/**
 * NEGATIVE TEST CASE: Наследник сломанного родительского класса
 * Symbol: BrokenInheritanceChild
 * Command: typeHierarchy/subtypes
 * Expected: ОШИБКА
 * Reason: Родительский класс BrokenParentClass содержит ошибки в определении.
 */
export class BrokenInheritanceChild extends BrokenParentClass {
  public extraValue: number = 42;
  
  public getExtra(): number {
    return this.extraValue;
  }
}

// ============================================================================
// ИНТЕРФЕЙС С ОШИБКАМИ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Интерфейс, расширяющий несуществующий интерфейс
 * Symbol: IBrokenInterface
 * Command: typeHierarchy/subtypes
 * Expected: ОШИБКА
 * Reason: Родительский интерфейс IMissingParent не существует.
 */
// @ts-expect-error - несуществующий родительский интерфейс
export interface IBrokenInterface extends IMissingParent {
  ownMethod(): void;
}

/**
 * NEGATIVE TEST CASE: Класс, реализующий сломанный интерфейс
 * Symbol: BrokenInterfaceImpl
 * Command: typeHierarchy/subtypes
 * Expected: ОШИБКА
 * Reason: Интерфейс IBrokenInterface содержит ошибки в определении.
 */
// @ts-expect-error - интерфейс содержит ошибки
export class BrokenInterfaceImpl implements IBrokenInterface {
  public ownMethod(): void {
    console.log('implementation of broken interface');
  }
}

// ============================================================================
// ДЖЕНЕРИКИ С ОШИБКАМИ
// ============================================================================

/**
 * Базовый дженерик-класс
 */
export class GenericBase<T> {
  protected value: T;
  
  constructor(value: T) {
    this.value = value;
  }
  
  public getValue(): T {
    return this.value;
  }
  
  public process(transformer: (val: T) => T): T {
    return transformer(this.value);
  }
}

/**
 * NEGATIVE TEST CASE: Дженерик-наследник с неправильным типом
 * Symbol: WrongGenericChild
 * Command: typeHierarchy/subtypes
 * Expected: ОШИБКА типов
 * Reason: Дженерик параметр не совместим с базовым типом.
 */
// @ts-expect-error - несовместимость дженерик типов
export class WrongGenericChild extends GenericBase<string> {
  public getValue(): number {  // Должен возвращать string
    return 42;
  }
}

/**
 * NEGATIVE TEST CASE: Дженерик с несуществующим ограничением
 * Symbol: BrokenGenericConstraint
 * Command: typeHierarchy/subtypes
 * Expected: ОШИБКА
 * Reason: Ограничение типа T ссылается на несуществующий тип.
 */
// @ts-expect-error - несуществующее ограничение типа
export class BrokenGenericConstraint<T extends IMissingConstraintType> {
  public value: T;
  
  constructor(value: T) {
    this.value = value;
  }
}

// ============================================================================
// АБСТРАКТНЫЕ КЛАССЫ С ОШИБКАМИ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Абстрактный класс с нереализованным абстрактным методом
 * Symbol: IncompleteAbstractClass
 * Command: typeHierarchy/subtypes
 * Expected: ОШИБКА при попытке создания наследника
 * Reason: Абстрактный метод не реализован в concrete классе.
 */
export abstract class IncompleteAbstractClass {
  public abstract requiredMethod(): void;
  public abstract anotherRequiredMethod(param: string): number;
  
  public concreteMethod(): string {
    return 'concrete implementation';
  }
}

/**
 * NEGATIVE TEST CASE: Наследник абстрактного класса без полной реализации
 * Symbol: PartialAbstractImpl
 * Command: typeHierarchy/subtypes
 * Expected: ОШИБКА компиляции
 * Reason: Не все абстрактные методы реализованы (отсутствует anotherRequiredMethod).
 */
// @ts-expect-error - неполная реализация абстрактного класса
export class PartialAbstractImpl extends IncompleteAbstractClass {
  public requiredMethod(): void {
    console.log('Only requiredMethod implemented');
  }
  // anotherRequiredMethod не реализован
}

// ============================================================================
// ЦИКЛИЧЕСКИЕ ЗАВИСИМОСТИ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Класс с потенциальной циклической зависимостью
 * Symbol: CircularA
 * Command: typeHierarchy/subtypes
 * Expected: ОШИБКА или неожидаемое поведение
 * Reason: Эмуляция циклической зависимости между классами.
 */
// @ts-expect-error - циклическая зависимость
export class CircularA extends (null as any) {
  public reference: unknown = null;
  
  public setReference(ref: unknown): void {
    this.reference = ref;
  }
}

/**
 * NEGATIVE TEST CASE: Второй класс в циклической зависимости
 * Symbol: CircularB
 * Command: typeHierarchy/subtypes
 * Expected: ОШИБКА
 * Reason: Циклическая ссылка на CircularA.
 */
// @ts-expect-error - циклическая зависимость
export class CircularB extends (null as any) {
  public parent: CircularA = null as any;
}

// ============================================================================
// ЭКСПОРТ ВСЕХ СЛОМАННЫХ ТИПОВ
// ============================================================================

export {
  BaseWithSignature,
  ICompleteInterface,
  IncompleteAbstractClass,
  GenericBase,
  CircularB
};
