/**
 * ============================================================================
 * LSP Method: typeHierarchy/subtypes
 * Description: Получение иерархии подтипов (наследников) для символа
 * ============================================================================
 * 
 * Этот файл содержит тестовые сценарии для проверки LSP-метода subtypes.
 * Метод возвращает список всех типов, которые наследуются от указанного
 * символа (классы-наследники и классы, реализующие интерфейс).
 */

import {
  VehicleBase,
  AbstractProcessor,
  IRepository,
  IHandler,
  ChainBase,
  ISealedService,
  FinalBaseClass,
  IStrategy,
  ComponentBase,
  IFactory
} from './subtypes-deps/base-types';

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ
// ============================================================================

/**
 * ---------------------------------------------------------------------------
 * Test Case 1: Базовый класс с несколькими наследниками
 * ---------------------------------------------------------------------------
 * Symbol: VehicleBase (из импорта, позиция в base-types.ts)
 * Command: typeHierarchy/subtypes
 * Expected: [Car, Motorcycle, Truck, ElectricCar]
 * 
 * Описание: Класс VehicleBase имеет несколько прямых наследников.
 * LSP должен вернуть все классы, которые наследуются от VehicleBase.
 */

// Наследник 1: Car
class Car extends VehicleBase {
  private doors: number;
  
  constructor(brand: string, year: number, doors: number) {
    super(brand, year);
    this.doors = doors;
  }
  
  public getDoors(): number {
    return this.doors;
  }
  
  public honk(): void {
    console.log('Beep beep!');
  }
}

// Наследник 2: Motorcycle
class Motorcycle extends VehicleBase {
  private engineCapacity: number;
  
  constructor(brand: string, year: number, engineCapacity: number) {
    super(brand, year);
    this.engineCapacity = engineCapacity;
  }
  
  public getEngineCapacity(): number {
    return this.engineCapacity;
  }
  
  public wheelie(): void {
    console.log('Doing a wheelie!');
  }
}

// Наследник 3: Truck
class Truck extends VehicleBase {
  private cargoCapacity: number;
  
  constructor(brand: string, year: number, cargoCapacity: number) {
    super(brand, year);
    this.cargoCapacity = cargoCapacity;
  }
  
  public getCargoCapacity(): number {
    return this.cargoCapacity;
  }
  
  public loadCargo(weight: number): void {
    console.log(`Loading ${weight} kg of cargo`);
  }
}

// Наследник 4: ElectricCar
class ElectricCar extends VehicleBase {
  private batteryCapacity: number;
  
  constructor(brand: string, year: number, batteryCapacity: number) {
    super(brand, year);
    this.batteryCapacity = batteryCapacity;
  }
  
  public getBatteryCapacity(): number {
    return this.batteryCapacity;
  }
  
  public charge(): void {
    console.log('Charging...');
  }
  
  // Переопределение метода родителя
  public startEngine(): void {
    console.log('Electric motor started (silently)');
  }
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 2: Интерфейс с несколькими реализациями
 * ---------------------------------------------------------------------------
 * Symbol: IRepository<T> (из импорта, позиция в base-types.ts)
 * Command: typeHierarchy/subtypes
 * Expected: [UserRepository, ProductRepository, OrderRepository]
 * 
 * Описание: Интерфейс IRepository имеет несколько реализаций.
 * LSP должен вернуть все классы, реализующие этот интерфейс.
 */

// Реализация 1: UserRepository
interface User {
  id: string;
  name: string;
  email: string;
}

class UserRepository implements IRepository<User> {
  private users: Map<string, User> = new Map();
  
  public findById(id: string): User | null {
    return this.users.get(id) || null;
  }
  
  public findAll(): User[] {
    return Array.from(this.users.values());
  }
  
  public save(entity: User): void {
    this.users.set(entity.id, entity);
  }
  
  public delete(id: string): void {
    this.users.delete(id);
  }
}

// Реализация 2: ProductRepository
interface Product {
  id: string;
  name: string;
  price: number;
}

class ProductRepository implements IRepository<Product> {
  private products: Map<string, Product> = new Map();
  
  public findById(id: string): Product | null {
    return this.products.get(id) || null;
  }
  
  public findAll(): Product[] {
    return Array.from(this.products.values());
  }
  
  public save(entity: Product): void {
    this.products.set(entity.id, entity);
  }
  
  public delete(id: string): void {
    this.products.delete(id);
  }
  
  // Дополнительный метод
  public findByPriceRange(min: number, max: number): Product[] {
    return this.findAll().filter(p => p.price >= min && p.price <= max);
  }
}

// Реализация 3: OrderRepository
interface Order {
  id: string;
  userId: string;
  products: string[];
  total: number;
}

class OrderRepository implements IRepository<Order> {
  private orders: Map<string, Order> = new Map();
  
  public findById(id: string): Order | null {
    return this.orders.get(id) || null;
  }
  
  public findAll(): Order[] {
    return Array.from(this.orders.values());
  }
  
  public save(entity: Order): void {
    this.orders.set(entity.id, entity);
  }
  
  public delete(id: string): void {
    this.orders.delete(id);
  }
  
  // Дополнительные методы
  public findByUserId(userId: string): Order[] {
    return this.findAll().filter(o => o.userId === userId);
  }
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 3: Абстрактный класс с конкретными наследниками
 * ---------------------------------------------------------------------------
 * Symbol: AbstractProcessor (из импорта, позиция в base-types.ts)
 * Command: typeHierarchy/subtypes
 * Expected: [DataProcessor, ImageProcessor, TextProcessor]
 * 
 * Описание: Абстрактный класс имеет несколько конкретных реализаций.
 */

// Реализация 1: DataProcessor
class DataProcessor extends AbstractProcessor {
  private processedCount: number = 0;
  
  constructor(name: string) {
    super(name);
  }
  
  public process(data: unknown): unknown {
    if (this.validate(data)) {
      this.processedCount++;
      return { processed: data, timestamp: Date.now() };
    }
    return null;
  }
  
  public validate(data: unknown): boolean {
    return data !== null && data !== undefined;
  }
  
  public getProcessedCount(): number {
    return this.processedCount;
  }
}

// Реализация 2: ImageProcessor
class ImageProcessor extends AbstractProcessor {
  private format: string;
  
  constructor(name: string, format: string) {
    super(name);
    this.format = format;
  }
  
  public process(data: unknown): unknown {
    if (this.validate(data)) {
      return { image: data, format: this.format };
    }
    return null;
  }
  
  public validate(data: unknown): boolean {
    return typeof data === 'string' && data.startsWith('data:image');
  }
  
  public getFormat(): string {
    return this.format;
  }
}

// Реализация 3: TextProcessor
class TextProcessor extends AbstractProcessor {
  private maxLength: number;
  
  constructor(name: string, maxLength: number) {
    super(name);
    this.maxLength = maxLength;
  }
  
  public process(data: unknown): unknown {
    if (this.validate(data)) {
      const text = String(data);
      return text.substring(0, this.maxLength);
    }
    return null;
  }
  
  public validate(data: unknown): boolean {
    return typeof data === 'string';
  }
  
  public getMaxLength(): number {
    return this.maxLength;
  }
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 4: Цепочка наследования (A ← B ← C)
 * ---------------------------------------------------------------------------
 * Symbol: ChainBase (из импорта, позиция в base-types.ts)
 * Command: typeHierarchy/subtypes
 * Expected: [ChainMiddle, ChainEnd]
 * 
 * Описание: Цепочка наследования из трёх уровней.
 * LSP должен вернуть всех наследников в цепочке.
 */

// Класс B в цепочке: ChainBase ← ChainMiddle
class ChainMiddle extends ChainBase {
  protected description: string;
  
  constructor(id: string, description: string) {
    super(id);
    this.description = description;
  }
  
  public getDescription(): string {
    return this.description;
  }
  
  public middleMethod(): void {
    console.log('Middle method');
  }
}

// Класс C в цепочке: ChainBase ← ChainMiddle ← ChainEnd
class ChainEnd extends ChainMiddle {
  private status: string;
  
  constructor(id: string, description: string, status: string) {
    super(id, description);
    this.status = status;
  }
  
  public getStatus(): string {
    return this.status;
  }
  
  public endMethod(): void {
    console.log('End method');
  }
  
  // Переопределение методов
  public baseMethod(): void {
    console.log('Overridden base method in ChainEnd');
  }
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 5: Интерфейс IHandler с несколькими реализациями
 * ---------------------------------------------------------------------------
 * Symbol: IHandler (из импорта, позиция в base-types.ts)
 * Command: typeHierarchy/subtypes
 * Expected: [AuthHandler, LogHandler, CacheHandler]
 * 
 * Описание: Интерфейс обработчика с различными реализациями.
 */

class AuthHandler implements IHandler {
  private authenticated: boolean = false;
  
  public handle(request: unknown): unknown {
    if (this.canHandle(request)) {
      this.authenticated = true;
      return { authenticated: true };
    }
    return null;
  }
  
  public canHandle(request: unknown): boolean {
    return typeof request === 'object' && request !== null && 'token' in request;
  }
  
  public isAuthenticated(): boolean {
    return this.authenticated;
  }
}

class LogHandler implements IHandler {
  private logs: string[] = [];
  
  public handle(request: unknown): unknown {
    if (this.canHandle(request)) {
      const logEntry = `[${new Date().toISOString()}] ${String(request)}`;
      this.logs.push(logEntry);
      return logEntry;
    }
    return null;
  }
  
  public canHandle(request: unknown): boolean {
    return request !== null && request !== undefined;
  }
  
  public getLogs(): string[] {
    return [...this.logs];
  }
}

class CacheHandler implements IHandler {
  private cache: Map<string, unknown> = new Map();
  
  public handle(request: unknown): unknown {
    if (this.canHandle(request)) {
      const key = String(request);
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }
      // Симуляция кэширования
      const result = { cached: request };
      this.cache.set(key, result);
      return result;
    }
    return null;
  }
  
  public canHandle(request: unknown): boolean {
    return typeof request === 'string' || typeof request === 'number';
  }
  
  public clearCache(): void {
    this.cache.clear();
  }
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 6: Паттерн Strategy - интерфейс с реализациями
 * ---------------------------------------------------------------------------
 * Symbol: IStrategy (из импорта, позиция в base-types.ts)
 * Command: typeHierarchy/subtypes
 * Expected: [SortStrategy, FilterStrategy, TransformStrategy]
 */

class SortStrategy implements IStrategy {
  private ascending: boolean;
  
  constructor(ascending: boolean = true) {
    this.ascending = ascending;
  }
  
  public execute(context: unknown): void {
    if (Array.isArray(context)) {
      context.sort((a, b) => {
        const comparison = String(a).localeCompare(String(b));
        return this.ascending ? comparison : -comparison;
      });
    }
  }
  
  public isAscending(): boolean {
    return this.ascending;
  }
}

class FilterStrategy implements IStrategy {
  private predicate: (item: unknown) => boolean;
  
  constructor(predicate: (item: unknown) => boolean) {
    this.predicate = predicate;
  }
  
  public execute(context: unknown): void {
    // В реальном сценарии здесь была бы фильтрация
    console.log('Executing filter strategy');
  }
  
  public getPredicate(): (item: unknown) => boolean {
    return this.predicate;
  }
}

class TransformStrategy implements IStrategy {
  private transformer: (item: unknown) => unknown;
  
  constructor(transformer: (item: unknown) => unknown) {
    this.transformer = transformer;
  }
  
  public execute(context: unknown): void {
    // В реальном сценарии здесь была бы трансформация
    console.log('Executing transform strategy');
  }
  
  public getTransformer(): (item: unknown) => unknown {
    return this.transformer;
  }
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 7: Паттерн Decorator - базовый класс с наследниками
 * ---------------------------------------------------------------------------
 * Symbol: ComponentBase (из импорта, позиция в base-types.ts)
 * Command: typeHierarchy/subtypes
 * Expected: [ConcreteComponent, DecoratorBase, ConcreteDecoratorA, ConcreteDecoratorB]
 */

class ConcreteComponent extends ComponentBase {
  public operation(): string {
    return 'ConcreteComponent';
  }
}

abstract class DecoratorBase extends ComponentBase {
  protected component: ComponentBase;
  
  constructor(component: ComponentBase) {
    super();
    this.component = component;
  }
  
  public abstract operation(): string;
}

class ConcreteDecoratorA extends DecoratorBase {
  public operation(): string {
    return `DecoratorA(${this.component.operation()})`;
  }
  
  public addedBehavior(): void {
    console.log('Added behavior A');
  }
}

class ConcreteDecoratorB extends DecoratorBase {
  public operation(): string {
    return `DecoratorB[${this.component.operation()}]`;
  }
  
  public addedState: string = 'state-b';
}

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ
// ============================================================================

/**
 * ---------------------------------------------------------------------------
 * Test Case 8: Класс без наследников (финальный)
 * ---------------------------------------------------------------------------
 * Symbol: FinalClass (позиция: строка ~410, класс FinalClass)
 * Command: typeHierarchy/subtypes
 * Expected: Пустой результат
 * 
 * Описание: Класс не имеет наследников. LSP должен вернуть пустой список.
 */
class FinalClass {
  private readonly id: string;
  
  constructor(id: string) {
    this.id = id;
  }
  
  public getId(): string {
    return this.id;
  }
  
  public doSomething(): void {
    console.log('Doing something final');
  }
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 9: Класс без наследников (наследует от FinalBaseClass)
 * ---------------------------------------------------------------------------
 * Symbol: FinalBaseClass (из импорта, позиция в base-types.ts)
 * Command: typeHierarchy/subtypes
 * Expected: Пустой результат или [FinalClassInheritor] если есть
 * 
 * Описание: Базовый класс, от которого никто не наследуется в проекте.
 */

/**
 * ---------------------------------------------------------------------------
 * Test Case 10: Запечатанный интерфейс (без реализаций)
 * ---------------------------------------------------------------------------
 * Symbol: ISealedService (из импорта, позиция в base-types.ts)
 * Command: typeHierarchy/subtypes
 * Expected: Пустой результат
 * 
 * Описание: Интерфейс без реализаций в проекте.
 */

/**
 * ---------------------------------------------------------------------------
 * Test Case 11: Примитивный тип (string)
 * ---------------------------------------------------------------------------
 * Symbol: primitiveString (позиция: строка ~452, переменная primitiveString)
 * Command: typeHierarchy/subtypes
 * Expected: Пустой результат или ошибка
 * 
 * Описание: Примитивные типы не имеют наследников.
 */
const primitiveString: string = 'I have no subtypes';

/**
 * ---------------------------------------------------------------------------
 * Test Case 12: Примитивный тип (number)
 * ---------------------------------------------------------------------------
 * Symbol: primitiveNumber (позиция: строка ~462, переменная primitiveNumber)
 * Command: typeHierarchy/subtypes
 * Expected: Пустой результат или ошибка
 */
const primitiveNumber: number = 42;

/**
 * ---------------------------------------------------------------------------
 * Test Case 13: Примитивный тип (boolean)
 * ---------------------------------------------------------------------------
 * Symbol: primitiveBoolean (позиция: строка ~471, переменная primitiveBoolean)
 * Command: typeHierarchy/subtypes
 * Expected: Пустой результат или ошибка
 */
const primitiveBoolean: boolean = true;

/**
 * ---------------------------------------------------------------------------
 * Test Case 14: Функция
 * ---------------------------------------------------------------------------
 * Symbol: standaloneFunction (позиция: строка ~480, функция standaloneFunction)
 * Command: typeHierarchy/subtypes
 * Expected: Пустой результат
 * 
 * Описание: Функции не имеют наследников в классическом понимании.
 */
function standaloneFunction(x: number): number {
  return x * 2;
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 15: Type Alias
 * ---------------------------------------------------------------------------
 * Symbol: CustomType (позиция: строка ~492, type alias CustomType)
 * Command: typeHierarchy/subtypes
 * Expected: Поведение зависит от реализации LSP
 * 
 * Описание: Type alias не может иметь наследников.
 */
type CustomType = {
  name: string;
  value: number;
};

/**
 * ---------------------------------------------------------------------------
 * Test Case 16: Enum
 * ---------------------------------------------------------------------------
 * Symbol: Status (позиция: строка ~504, enum Status)
 * Command: typeHierarchy/subtypes
 * Expected: Пустой результат
 * 
 * Описание: Enum не имеет наследников.
 */
enum Status {
  Pending = 'PENDING',
  Active = 'ACTIVE',
  Completed = 'COMPLETED',
  Failed = 'FAILED'
}

// ============================================================================
// ДОПОЛНИТЕЛЬНЫЕ ТЕСТОВЫЕ СЦЕНАРИИ
// ============================================================================

/**
 * ---------------------------------------------------------------------------
 * Test Case 17: Интерфейс IFactory с реализациями
 * ---------------------------------------------------------------------------
 * Symbol: IFactory<T> (из импорта, позиция в base-types.ts)
 * Command: typeHierarchy/subtypes
 * Expected: [UserFactory, ProductFactory]
 */

interface UserEntity {
  id: string;
  name: string;
}

class UserFactory implements IFactory<UserEntity> {
  private counter: number = 0;
  
  public create(): UserEntity {
    this.counter++;
    return {
      id: `user-${this.counter}`,
      name: `User ${this.counter}`
    };
  }
  
  public reset(): void {
    this.counter = 0;
  }
  
  public getCounter(): number {
    return this.counter;
  }
}

interface ProductEntity {
  id: string;
  title: string;
  price: number;
}

class ProductFactory implements IFactory<ProductEntity> {
  private defaultPrice: number;
  
  constructor(defaultPrice: number = 0) {
    this.defaultPrice = defaultPrice;
  }
  
  public create(): ProductEntity {
    return {
      id: `prod-${Date.now()}`,
      title: 'New Product',
      price: this.defaultPrice
    };
  }
  
  public reset(): void {
    // Ничего не делаем для этого примера
  }
  
  public setDefaultPrice(price: number): void {
    this.defaultPrice = price;
  }
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 18: Класс с вложенным наследованием
 * ---------------------------------------------------------------------------
 * Symbol: OuterWithInner (позиция: строка ~585, класс OuterWithInner)
 * Command: typeHierarchy/subtypes
 * Expected: Пустой результат (внешний класс не имеет наследников)
 * 
 * Описание: Вложенные классы не считаются наследниками внешнего класса.
 */
class OuterWithInner {
  public outerValue: string;
  
  constructor(outerValue: string) {
    this.outerValue = outerValue;
  }
  
  public outerMethod(): void {
    console.log('Outer method');
  }
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 19: Класс с приватным наследником (внутри того же файла)
 * ---------------------------------------------------------------------------
 * Symbol: PublicBaseClass (позиция: строка ~605, класс PublicBaseClass)
 * Command: typeHierarchy/subtypes
 * Expected: [PrivateChildClass]
 * 
 * Описание: Даже приватные наследники должны быть найдены LSP.
 */
class PublicBaseClass {
  protected value: string;
  
  constructor(value: string) {
    this.value = value;
  }
  
  public getValue(): string {
    return this.value;
  }
}

// Локальный наследник
class PrivateChildClass extends PublicBaseClass {
  private extra: number;
  
  constructor(value: string, extra: number) {
    super(value);
    this.extra = extra;
  }
  
  public getExtra(): number {
    return this.extra;
  }
}

/**
 * ---------------------------------------------------------------------------
 * Test Case 20: Множественное наследование интерфейсов
 * ---------------------------------------------------------------------------
 * Symbol: IMultiBase (позиция: строка ~636, интерфейс IMultiBase)
 * Command: typeHierarchy/subtypes
 * Expected: [MultiImplementation]
 * 
 * Описание: Интерфейс с классом, реализующим его вместе с другими интерфейсами.
 */
interface IMultiBase {
  baseMethod(): void;
}

interface IMultiExtension {
  extensionMethod(): void;
}

class MultiImplementation implements IMultiBase, IMultiExtension {
  public baseMethod(): void {
    console.log('Base method implemented');
  }
  
  public extensionMethod(): void {
    console.log('Extension method implemented');
  }
}

// Экспорт для использования в других модулях
export {
  // Test Case 1
  Car,
  Motorcycle,
  Truck,
  ElectricCar,
  // Test Case 2
  UserRepository,
  ProductRepository,
  OrderRepository,
  // Test Case 3
  DataProcessor,
  ImageProcessor,
  TextProcessor,
  // Test Case 4
  ChainMiddle,
  ChainEnd,
  // Test Case 5
  AuthHandler,
  LogHandler,
  CacheHandler,
  // Test Case 6
  SortStrategy,
  FilterStrategy,
  TransformStrategy,
  // Test Case 7
  ConcreteComponent,
  DecoratorBase,
  ConcreteDecoratorA,
  ConcreteDecoratorB,
  // Test Case 8
  FinalClass,
  // Test Case 17
  UserFactory,
  ProductFactory,
  // Test Case 19
  PublicBaseClass,
  PrivateChildClass,
  // Test Case 20
  MultiImplementation
};

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ С НЕВАЛИДНЫМ КОДОМ
// ============================================================================

{
  /**
   * NEGATIVE TEST CASE: Поиск подтипов для несуществующего класса
   * Symbol: NonExistentClass (класс не существует)
   * Command: typeHierarchy/subtypes
   * Expected: ОШИБКА или ПУСТОЙ РЕЗУЛЬТАТ
   * Reason: Невозможно найти подтипы для класса, который не определён в проекте.
   */
  // @ts-expect-error - намеренная ошибка: класс не существует
  const _instance: NonExistentClass = null;
  console.log(_instance);
}

{
  /**
   * NEGATIVE TEST CASE: Абстрактный класс без наследников в сломанном контексте
   * Symbol: BrokenAbstractClass (абстрактный класс с ошибками)
   * Command: typeHierarchy/subtypes
   * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
   * Reason: Абстрактный класс определён с ошибками, наследники не могут быть корректно созданы.
   */
  // @ts-expect-error - абстрактный класс с несуществующим базовым типом
  abstract class BrokenAbstractClass extends NonExistentAbstractBase {
    public abstract process(): void;
  }
  
  // Потенциальный наследник не может корректно наследовать сломанный базовый класс
  // @ts-expect-error - базовый класс содержит ошибки
  class BrokenConcreteChild extends BrokenAbstractClass {
    public process(): void {
      console.log('broken implementation');
    }
  }
}

{
  /**
   * NEGATIVE TEST CASE: Интерфейс без реализаций в сломанном контексте
   * Symbol: IBrokenInterface (интерфейс с ошибками в определении)
   * Command: typeHierarchy/subtypes
   * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
   * Reason: Интерфейс ссылается на несуществующие типы, реализации невозможны.
   */
  // @ts-expect-error - интерфейс ссылается на несуществующий тип
  interface IBrokenInterface extends IMissingBaseInterface {
    brokenMethod(param: IMissingType): void;
  }
}

{
  /**
   * NEGATIVE TEST CASE: Поиск подтипов для типа, не являющегося классом/интерфейсом
   * Symbol: brokenVariable (переменная с типом объединения)
   * Command: typeHierarchy/subtypes
   * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
   * Reason: Переменные и типы объединения не могут иметь подтипов в классическом понимании.
   */
  const brokenVariable: string | number | boolean = 'broken';
  console.log(brokenVariable);
}

{
  /**
   * NEGATIVE TEST CASE: Поиск подтипов для null типа
   * Symbol: nullType (null значение)
   * Command: typeHierarchy/subtypes
   * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
   * Reason: null не является классом или интерфейсом.
   */
  const nullType: null = null;
  console.log(nullType);
}

{
  /**
   * NEGATIVE TEST CASE: Поиск подтипов для undefined типа
   * Symbol: undefinedType (undefined значение)
   * Command: typeHierarchy/subtypes
   * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
   * Reason: undefined не является классом или интерфейсом.
   */
  const undefinedType: undefined = undefined;
  console.log(undefinedType);
}

{
  /**
   * NEGATIVE TEST CASE: Поиск подтипов для типа функции
   * Symbol: brokenFunction (функция)
   * Command: typeHierarchy/subtypes
   * Expected: ПУСТОЙ РЕЗУЛЬТАТ
   * Reason: Функции не имеют подтипов в иерархии классов.
   */
  function brokenFunction(param: unknown): unknown {
    return param;
  }
  console.log(brokenFunction);
}

{
  /**
   * NEGATIVE TEST CASE: Поиск подтипов для типа массива
   * Symbol: brokenArray (массив)
   * Command: typeHierarchy/subtypes
   * Expected: ПУСТОЙ РЕЗУЛЬТАТ или неожидаемое поведение
   * Reason: Массив является встроенным типом, не имеющим наследников в пользовательском коде.
   */
  const brokenArray: string[] = ['broken', 'array'];
  console.log(brokenArray);
}

{
  /**
   * NEGATIVE TEST CASE: Поиск подтипов для типа кортежа
   * Symbol: brokenTuple (кортеж)
   * Command: typeHierarchy/subtypes
   * Expected: ПУСТОЙ РЕЗУЛЬТАТ
   * Reason: Кортежи не участвуют в иерархии типов как классы.
   */
  const brokenTuple: [string, number, boolean] = ['test', 42, true];
  console.log(brokenTuple);
}

{
  /**
   * NEGATIVE TEST CASE: Класс с приватным конструктором (эмуляция final)
   * Symbol: SealedClass (класс с приватным конструктором)
   * Command: typeHierarchy/subtypes
   * Expected: ПУСТОЙ РЕЗУЛЬТАТ (наследование невозможно вне класса)
   * Reason: Приватный конструктор предотвращает создание наследников вне тела класса.
   */
  class SealedClass {
    private static _instance: SealedClass | null = null;
    
    private constructor(private value: string) {}
    
    public static getInstance(): SealedClass {
      if (!SealedClass._instance) {
        SealedClass._instance = new SealedClass('sealed');
      }
      return SealedClass._instance;
    }
    
    public getValue(): string {
      return this.value;
    }
  }
  
  // Попытка наследования невозможна
  // @ts-expect-error - конструктор SealedClass приватный
  class AttemptedInheritance extends SealedClass {
    public extra: string = '';
  }
}

{
  /**
   * NEGATIVE TEST CASE: Тип never
   * Symbol: neverType (тип never)
   * Command: typeHierarchy/subtypes
   * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
   * Reason: Тип never не может иметь экземпляров или наследников.
   */
  const neverFunction = (): never => {
    throw new Error('Never returns');
  };
  console.log(neverFunction);
}

{
  /**
   * NEGATIVE TEST CASE: Тип unknown
   * Symbol: unknownType (тип unknown)
   * Command: typeHierarchy/subtypes
   * Expected: ПУСТОЙ РЕЗУЛЬТАТ или неожидаемое поведение
   * Reason: unknown является особым типом TypeScript, не участвующим в иерархии классов.
   */
  const unknownType: unknown = { arbitrary: 'data' };
  console.log(unknownType);
}

{
  /**
   * NEGATIVE TEST CASE: Тип any
   * Symbol: anyType (тип any)
   * Command: typeHierarchy/subtypes
   * Expected: ПУСТОЙ РЕЗУЛЬТАТ или неожидаемое поведение
   * Reason: any отключает проверку типов и не имеет иерархии.
   */
  const anyType: any = 'anything goes';
  console.log(anyType);
}

// Импорт сломанных типов из отдельного файла для кросс-файловых тестов
import {
  BrokenInheritanceChild,
  IncompleteImplementation,
  FinalLikeClass,
  WrongSignatureChild
} from './subtypes-deps/broken-inheritance';

{
  /**
   * NEGATIVE TEST CASE: Наследник с неправильной сигнатурой метода
   * Symbol: WrongSignatureChild (из broken-inheritance.ts)
   * Command: typeHierarchy/subtypes
   * Expected: ОШИБКА или некорректный результат
   * Reason: Метод наследника не соответствует сигнатуре базового класса.
   */
  const _wrongSig: WrongSignatureChild = null as any;
  console.log(_wrongSig);
}

{
  /**
   * NEGATIVE TEST CASE: Реализация интерфейса с пропущенными методами
   * Symbol: IncompleteImplementation (из broken-inheritance.ts)
   * Command: typeHierarchy/subtypes
   * Expected: ОШИБКА компиляции
   * Reason: Не все методы интерфейса реализованы.
   */
  const _incomplete: IncompleteImplementation = null as any;
  console.log(_incomplete);
}

{
  /**
   * NEGATIVE TEST CASE: Класс, наследующий от final-подобного класса
   * Symbol: FinalLikeClass (из broken-inheritance.ts)
   * Command: typeHierarchy/subtypes
   * Expected: ОШИБКА или ПУСТОЙ РЕЗУЛЬТАТ
   * Reason: Класс спроектирован как final через приватный конструктор.
   */
  const _final: FinalLikeClass = null as any;
  console.log(_final);
}

{
  /**
   * NEGATIVE TEST CASE: Наследник сломанного родительского класса
   * Symbol: BrokenInheritanceChild (из broken-inheritance.ts)
   * Command: typeHierarchy/subtypes
   * Expected: ОШИБКА
   * Reason: Родительский класс содержит ошибки в определении.
   */
  const _brokenChild: BrokenInheritanceChild = null as any;
  console.log(_brokenChild);
}
