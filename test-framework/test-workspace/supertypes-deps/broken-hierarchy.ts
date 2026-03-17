/**
 * ============================================================================
 * BROKEN HIERARCHY TYPES
 * Description: Типы с намеренными ошибками для тестирования отказоустойчивости LSP
 * ============================================================================
 * 
 * Этот файл содержит типы с различными нарушениями в иерархии наследования.
 * Используется для проверки того, как LSP обрабатывает некорректный код.
 */

// ============================================================================
// ЦИКЛИЧЕСКИЕ ЗАВИСИМОСТИ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Класс с циклической зависимостью
 * Symbol: BrokenHierarchyClass
 * Command: typeHierarchy/supertypes
 * Expected: ОШИБКА или неполный результат
 * Reason: Циклическая зависимость между классами делает невозможным
 *          построение корректной иерархии типов.
 */
// Эмуляция циклической зависимости через any
// @ts-expect-error - намеренная ошибка для тестирования
export class BrokenHierarchyClass extends (null as any) {
  public name: string = 'broken';
  
  public getName(): string {
    return this.name;
  }
}

/**
 * NEGATIVE TEST CASE: Второй класс в циклической зависимости
 * Symbol: CircularDependencyB
 * Command: typeHierarchy/supertypes
 * Expected: ОШИБКА
 * Reason: Циклическая ссылка на BrokenHierarchyClass.
 */
// @ts-expect-error - циклическая зависимость
export class CircularDependencyB extends (null as any) {
  public value: number = 0;
  
  // Попытка создать циклическую ссылку
  public parent: BrokenHierarchyClass = null as any;
}

// ============================================================================
// НЕСУЩЕСТВУЮЩИЕ ТИПЫ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Интерфейс со ссылкой на несуществующий тип
 * Symbol: BrokenInterfaceRef
 * Command: typeHierarchy/supertypes
 * Expected: ОШИБКА
 * Reason: Интерфейс расширяет тип, который не существует.
 */
// @ts-expect-error - INonExistentInterface не существует
export interface BrokenInterfaceRef extends INonExistentInterface {
  validMethod(): void;
}

/**
 * NEGATIVE TEST CASE: Интерфейс с множественными несуществующими родителями
 * Symbol: MultiBrokenInterface
 * Command: typeHierarchy/supertypes
 * Expected: ОШИБКА
 * Reason: Все родительские интерфейсы не существуют.
 */
// @ts-expect-error - родительские интерфейсы не существуют
export interface MultiBrokenInterface extends IMissingBase, IMissingExtension {
  ownMethod(): string;
}

// ============================================================================
// СЛОМАННЫЕ ЦЕПОЧКИ НАСЛЕДОВАНИЯ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Сломанная цепочка наследования
 * Symbol: BrokenChainClass
 * Command: typeHierarchy/supertypes
 * Expected: ОШИБКА или частичный результат
 * Reason: Промежуточный класс в цепочке наследования не существует.
 */
// @ts-expect-error - MissingMiddleClass не существует
export class BrokenChainClass extends MissingMiddleClass {
  public finalValue: string = 'end of broken chain';
}

/**
 * NEGATIVE TEST CASE: Класс наследуется от типа с ошибкой
 * Symbol: InheritingFromBroken
 * Command: typeHierarchy/supertypes
 * Expected: ОШИБКА
 * Reason: Базовый класс сам содержит ошибки в своём определении.
 */
export class InheritingFromBroken extends BrokenHierarchyClass {
  public extraProperty: boolean = true;
  
  public doSomething(): void {
    console.log('Inheriting from broken class');
  }
}

// ============================================================================
// НЕКОРРЕКТНЫЕ ТИПЫ ДАННЫХ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Класс наследуется от типа функции
 * Symbol: FunctionBase
 * Command: typeHierarchy/supertypes
 * Expected: ОШИБКА
 * Reason: Функция не может быть базовым классом.
 */
type FunctionType = () => string;

// @ts-expect-error - функция не может быть базовым классом
export class FunctionBase extends FunctionType {
  public additionalMethod(): number {
    return 42;
  }
}

/**
 * NEGATIVE TEST CASE: Класс наследуется от массива
 * Symbol: ArrayBase
 * Command: typeHierarchy/supertypes
 * Expected: ОШИБКА (или работает в некоторых случаях)
 * Reason: Array является встроенным типом, наследование может не работать ожидаемо.
 */
// @ts-expect-error - Array не может быть напрямую расширен таким образом
export class ArrayBase extends Array<string> {
  public customMethod(): string {
    return this.join('-');
  }
}

// ============================================================================
// НЕВЕРНЫЕ ИМПЛЕМЕНТАЦИИ ИНТЕРФЕЙСОВ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Класс реализует несуществующий интерфейс
 * Symbol: BrokenImplClass
 * Command: typeHierarchy/supertypes
 * Expected: ОШИБКА
 * Reason: Интерфейс IBrokenInterface не определён.
 */
// @ts-expect-error - интерфейс не существует
export class BrokenImplClass implements IBrokenInterface {
  public brokenMethod(): void {
    console.log('broken');
  }
}

/**
 * NEGATIVE TEST CASE: Класс с частичной реализацией интерфейса
 * Symbol: PartialImplClass
 * Command: typeHierarchy/supertypes
 * Expected: ОШИБКА компиляции
 * Reason: Не все методы интерфейса реализованы.
 */
interface IStrictInterface {
  methodA(): void;
  methodB(): void;
  methodC(): void;
}

// @ts-expect-error - не все методы реализованы
export class PartialImplClass implements IStrictInterface {
  public methodA(): void {
    console.log('A');
  }
  // methodB и methodC не реализованы
}

// ============================================================================
// ДЖЕНЕРИКИ С ОШИБКАМИ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Дженерик с несуществующим ограничением
 * Symbol: BrokenGeneric
 * Command: typeHierarchy/supertypes
 * Expected: ОШИБКА
 * Reason: Ограничение типа T ссылается на несуществующий тип.
 */
// @ts-expect-error - IMissingConstraint не существует
export class BrokenGeneric<T extends IMissingConstraint> {
  public value: T;
  
  constructor(value: T) {
    this.value = value;
  }
}

/**
 * NEGATIVE TEST CASE: Дженерик с циклическим ограничением
 * Symbol: CircularGeneric
 * Command: typeHierarchy/supertypes
 * Expected: ОШИБКА или неожиданное поведение
 * Reason: Циклическое ограничение дженерика.
 */
export class CircularGeneric<T extends CircularGeneric<T>> {
  public data: T | null = null;
}

// ============================================================================
// ЭКСПОРТ СЛОМАННЫХ ТИПОВ
// ============================================================================

export {
  CircularDependencyB,
  InheritingFromBroken,
  ArrayBase
};
