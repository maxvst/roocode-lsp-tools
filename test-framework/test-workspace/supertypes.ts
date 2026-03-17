/**
 * ============================================================================
 * LSP Method: typeHierarchy/supertypes
 * Description: Получение иерархии супертипов (родительских типов) для символа
 * ============================================================================
 * 
 * Этот файл содержит тестовые сценарии для проверки LSP-метода supertypes.
 * Метод возвращает список всех родительских типов (классов и интерфейсов)
 * для указанного символа.
 */

import { 
  BaseClass, 
  RootClass, 
  MiddleClass, 
  AbstractEntity 
} from './supertypes-deps/base-classes';

import {
  IBaseInterface,
  ISerializable,
  IComparable,
  ICloneable,
  IExtendedInterface,
  ICompositeInterface,
  IObserver,
  ISubject
} from './supertypes-deps/interfaces';

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ
// ============================================================================

/**
 * ---------------------------------------------------------------------------
 * Test Case 1: Класс с явным наследованием (extends)
 * ---------------------------------------------------------------------------
 * Symbol: ChildClass (позиция: строка ~55, класс ChildClass)
 * Command: typeHierarchy/supertypes
 * Expected: [BaseClass, Object]
 * 
 * Описание: Класс ChildClass явно наследуется от BaseClass.
 * LSP должен вернуть BaseClass как прямой супертип.
 */
class ChildClass extends BaseClass {
  private age: number;
  
  constructor(name: string, age: number) {
    super(name);
    this.age = age;
  }
  
  public getAge(): number {
    return this.age;
  }
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 2: Класс с множественным наследованием через интерфейсы (implements)
 * ---------------------------------------------------------------------------
 * Symbol: MultiInterfaceClass (позиция: строка ~78, класс MultiInterfaceClass)
 * Command: typeHierarchy/supertypes
 * Expected: [ISerializable, IComparable<MultiInterfaceClass>, Object]
 * 
 * Описание: Класс реализует несколько интерфейсов одновременно.
 * LSP должен вернуть все реализованные интерфейсы.
 */
class MultiInterfaceClass implements ISerializable, IComparable<MultiInterfaceClass> {
  private data: string;
  
  constructor(data: string) {
    this.data = data;
  }
  
  public serialize(): string {
    return this.data;
  }
  
  public deserialize(data: string): void {
    this.data = data;
  }
  
  public compareTo(other: MultiInterfaceClass): number {
    return this.data.localeCompare(other.data);
  }
  
  public equals(other: MultiInterfaceClass): boolean {
    return this.data === other.data;
  }
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 3: Класс с extends и implements одновременно
 * ---------------------------------------------------------------------------
 * Symbol: FullFeaturedClass (позиция: строка ~112, класс FullFeaturedClass)
 * Command: typeHierarchy/supertypes
 * Expected: [MiddleClass, RootClass, ICloneable<FullFeaturedClass>, Object]
 * 
 * Описание: Класс наследуется от другого класса и реализует интерфейс.
 * LSP должен вернуть цепочку наследования класса и все интерфейсы.
 */
class FullFeaturedClass extends MiddleClass implements ICloneable<FullFeaturedClass> {
  private metadata: Record<string, unknown>;
  
  constructor(id: number, description: string, metadata: Record<string, unknown>) {
    super(id, description);
    this.metadata = metadata;
  }
  
  public getMetadata(): Record<string, unknown> {
    return this.metadata;
  }
  
  public clone(): FullFeaturedClass {
    return new FullFeaturedClass(
      this.getId(),
      this.getDescription(),
      { ...this.metadata }
    );
  }
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 4: Интерфейс, расширяющий другой интерфейс
 * ---------------------------------------------------------------------------
 * Symbol: ICustomExtendedInterface (позиция: строка ~142, интерфейс ICustomExtendedInterface)
 * Command: typeHierarchy/supertypes
 * Expected: [IExtendedInterface, IBaseInterface]
 * 
 * Описание: Интерфейс наследуется от другого интерфейса, который сам
 * наследуется от базового интерфейса. Должна вернуться вся цепочка.
 */
interface ICustomExtendedInterface extends IExtendedInterface {
  version: string;
  getVersion(): string;
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 5: Класс, реализующий расширенный интерфейс
 * ---------------------------------------------------------------------------
 * Symbol: CustomClass (позиция: строка ~158, класс CustomClass)
 * Command: typeHierarchy/supertypes
 * Expected: [ICustomExtendedInterface, IExtendedInterface, IBaseInterface, Object]
 * 
 * Описание: Класс реализует интерфейс с цепочкой наследования.
 */
class CustomClass implements ICustomExtendedInterface {
  public id: number;
  public description: string;
  public version: string;
  
  constructor(id: number, description: string, version: string) {
    this.id = id;
    this.description = description;
    this.version = version;
  }
  
  public getName(): string {
    return `Item-${this.id}`;
  }
  
  public getDescription(): string {
    return this.description;
  }
  
  public getVersion(): string {
    return this.version;
  }
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 6: Класс с наследованием (InnerClass)
 * ---------------------------------------------------------------------------
 * Symbol: InnerClass (позиция: строка ~193, класс InnerClass)
 * Command: typeHierarchy/supertypes
 * Expected: [BaseClass, Object]
 *
 * Описание: Класс InnerClass наследуется от BaseClass.
 * LSP должен корректно определить супертип.
 */
class OuterClass {
  public outerProperty: string;
  
  constructor(outerProperty: string) {
    this.outerProperty = outerProperty;
  }
}

class InnerClass extends BaseClass {
  private innerProperty: number;
  
  constructor(name: string, innerProperty: number) {
    super(name);
    this.innerProperty = innerProperty;
  }
  
  public getInnerProperty(): number {
    return this.innerProperty;
  }
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 7: Класс, наследующий от абстрактного класса
 * ---------------------------------------------------------------------------
 * Symbol: ConcreteEntity (позиция: строка ~223, класс ConcreteEntity)
 * Command: typeHierarchy/supertypes
 * Expected: [AbstractEntity, Object]
 * 
 * Описание: Конкретный класс наследуется от абстрактного.
 */
class ConcreteEntity extends AbstractEntity {
  public readonly type: string = 'concrete';
  private data: unknown;
  
  constructor(data: unknown) {
    super();
    this.data = data;
  }
  
  public validate(): boolean {
    return this.data !== null && this.data !== undefined;
  }
  
  public getData(): unknown {
    return this.data;
  }
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 8: Класс с дженерик-интерфейсом
 * ---------------------------------------------------------------------------
 * Symbol: ObservableSubject (позиция: строка ~250, класс ObservableSubject)
 * Command: typeHierarchy/supertypes
 * Expected: [ISubject<string>, Object]
 * 
 * Описание: Класс реализует дженерик-интерфейс с конкретным типом.
 */
class ObservableSubject implements ISubject<string> {
  private observers: IObserver<string>[] = [];
  private state: string = '';
  
  public attach(observer: IObserver<string>): void {
    this.observers.push(observer);
  }
  
  public detach(observer: IObserver<string>): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }
  
  public notify(data: string): void {
    this.observers.forEach(observer => observer.update(data));
  }
  
  public setState(state: string): void {
    this.state = state;
    this.notify(state);
  }
}

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ
// ============================================================================

/**
 * ---------------------------------------------------------------------------
 * Test Case 9: Класс без явного наследования (только Object)
 * ---------------------------------------------------------------------------
 * Symbol: StandaloneClass (позиция: строка ~293, класс StandaloneClass)
 * Command: typeHierarchy/supertypes
 * Expected: [Object] или пустой результат (зависит от реализации LSP)
 * 
 * Описание: Класс без явного наследования. В TypeScript все классы
 * неявно наследуются от Object, но LSP может не возвращать Object.
 */
class StandaloneClass {
  public value: string;
  
  constructor(value: string) {
    this.value = value;
  }
  
  public getValue(): string {
    return this.value;
  }
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 10: Примитивный тип (string)
 * ---------------------------------------------------------------------------
 * Symbol: primitiveVariable (позиция: строка ~313, переменная primitiveVariable)
 * Command: typeHierarchy/supertypes
 * Expected: Пустой результат или ошибка (примитивы не имеют иерархии типов)
 * 
 * Описание: Примитивные типы не имеют иерархии наследования в TypeScript.
 */
const primitiveVariable: string = 'Hello, World!';

/**
 * ---------------------------------------------------------------------------
 * Test Case 11: Примитивный тип (number)
 * ---------------------------------------------------------------------------
 * Symbol: numericVariable (позиция: строка ~323, переменная numericVariable)
 * Command: typeHierarchy/supertypes
 * Expected: Пустой результат или ошибка
 */
const numericVariable: number = 42;

/**
 * ---------------------------------------------------------------------------
 * Test Case 12: Примитивный тип (boolean)
 * ---------------------------------------------------------------------------
 * Symbol: booleanVariable (позиция: строка ~332, переменная booleanVariable)
 * Command: typeHierarchy/supertypes
 * Expected: Пустой результат или ошибка
 */
const booleanVariable: boolean = true;

/**
 * ---------------------------------------------------------------------------
 * Test Case 13: Литерал объекта
 * ---------------------------------------------------------------------------
 * Symbol: objectLiteral (позиция: строка ~341, переменная objectLiteral)
 * Command: typeHierarchy/supertypes
 * Expected: Пустой результат или Object (зависит от реализации)
 * 
 * Описание: Литералы объектов не имеют явной иерархии типов.
 */
const objectLiteral = {
  name: 'Object Literal',
  value: 100,
  nested: {
    property: 'nested value'
  }
};

/**
 * ---------------------------------------------------------------------------
 * Test Case 14: Тип объединения (Union Type)
 * ---------------------------------------------------------------------------
 * Symbol: unionVariable (позиция: строка ~357, переменная unionVariable)
 * Command: typeHierarchy/supertypes
 * Expected: Поведение зависит от реализации LSP
 * 
 * Описание: Типы объединения не имеют прямой иерархии наследования.
 */
const unionVariable: string | number = 'could be string or number';

/**
 * ---------------------------------------------------------------------------
 * Test Case 15: Функция
 * ---------------------------------------------------------------------------
 * Symbol: standaloneFunction (позиция: строка ~367, функция standaloneFunction)
 * Command: typeHierarchy/supertypes
 * Expected: Пустой результат или Function (зависит от реализации)
 * 
 * Описание: Функции не имеют иерархии типов в классическом понимании.
 */
function standaloneFunction(param: string): number {
  return param.length;
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 16: Type Alias
 * ---------------------------------------------------------------------------
 * Symbol: TypeAliasUser (позиция: строка ~379, класс TypeAliasUser)
 * Command: typeHierarchy/supertypes
 * Expected: [Object] - type alias не влияет на иерархию
 * 
 * Описание: Type alias создаёт псевдоним типа, но не влияет на иерархию.
 */
type StringMap = Record<string, string>;

class TypeAliasUser {
  private data: StringMap;
  
  constructor(data: StringMap) {
    this.data = data;
  }
}

// ============================================================================
// ДОПОЛНИТЕЛЬНЫЕ ТЕСТОВЫЕ СЦЕНАРИИ
// ============================================================================

/**
 * ---------------------------------------------------------------------------
 * Test Case 17: Цепочка наследования (A ← B ← C)
 * ---------------------------------------------------------------------------
 * Symbol: GrandChildClass (позиция: строка ~400, класс GrandChildClass)
 * Command: typeHierarchy/supertypes
 * Expected: [ChildClass, BaseClass, Object]
 * 
 * Описание: Три уровня наследования. Должна вернуться вся цепочка.
 */
class GrandChildClass extends ChildClass {
  private grade: string;
  
  constructor(name: string, age: number, grade: string) {
    super(name, age);
    this.grade = grade;
  }
  
  public getGrade(): string {
    return this.grade;
  }
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 18: Класс с приватным конструктором (Singleton pattern)
 * ---------------------------------------------------------------------------
 * Symbol: SingletonClass (позиция: строка ~420, класс SingletonClass)
 * Command: typeHierarchy/supertypes
 * Expected: [Object]
 * 
 * Описание: Паттерн Singleton не влияет на иерархию типов.
 */
class SingletonClass {
  private static instance: SingletonClass | null = null;
  
  private constructor(private value: string) {}
  
  public static getInstance(): SingletonClass {
    if (!SingletonClass.instance) {
      SingletonClass.instance = new SingletonClass('singleton');
    }
    return SingletonClass.instance;
  }
  
  public getValue(): string {
    return this.value;
  }
}

// Экспорт для использования в других модулях
export {
  ChildClass,
  MultiInterfaceClass,
  FullFeaturedClass,
  ICustomExtendedInterface,
  CustomClass,
  OuterClass,
  InnerClass,
  ConcreteEntity,
  ObservableSubject,
  StandaloneClass,
  GrandChildClass,
  SingletonClass,
  TypeAliasUser
};
