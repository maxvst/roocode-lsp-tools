/**
 * Базовые типы для тестирования typeHierarchy/subtypes
 * Эти классы и интерфейсы используются как родительские типы,
 * от которых наследуют в основном файле subtypes.ts
 */

/**
 * Базовый класс с несколькими наследниками
 * Используется для тестирования поиска всех подтипов
 */
export class VehicleBase {
  protected brand: string;
  protected year: number;
  
  constructor(brand: string, year: number) {
    this.brand = brand;
    this.year = year;
  }
  
  public getInfo(): string {
    return `${this.brand} (${this.year})`;
  }
  
  public startEngine(): void {
    console.log('Engine started');
  }
}

/**
 * Абстрактный класс для тестирования наследования
 * Конкретные наследники должны реализовать абстрактные методы
 */
export abstract class AbstractProcessor {
  protected name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  public getName(): string {
    return this.name;
  }
  
  public abstract process(data: unknown): unknown;
  public abstract validate(data: unknown): boolean;
}

/**
 * Интерфейс с несколькими реализациями
 * Используется для тестирования поиска всех классов-реализаций
 */
export interface IRepository<T> {
  findById(id: string): T | null;
  findAll(): T[];
  save(entity: T): void;
  delete(id: string): void;
}

/**
 * Интерфейс для обработчиков событий
 */
export interface IHandler {
  handle(request: unknown): unknown;
  canHandle(request: unknown): boolean;
}

/**
 * Базовый класс для цепочки наследования A ← B ← C
 * Это класс A в цепочке
 */
export class ChainBase {
  protected id: string;
  
  constructor(id: string) {
    this.id = id;
  }
  
  public getId(): string {
    return this.id;
  }
  
  public baseMethod(): void {
    console.log('Base method');
  }
}

/**
 * Запечатанный интерфейс (sealed interface pattern)
 * В TypeScript нет встроенной поддержки sealed, но это демонстрация
 * паттерна с использованием branded types или документирования
 */
export interface ISealedService {
  readonly _brand: unique symbol;
  execute(): void;
}

/**
 * Базовый класс для демонстрации финального класса
 * (в TypeScript нет ключевого слова final, но класс может не иметь наследников)
 */
export class FinalBaseClass {
  protected value: number;
  
  constructor(value: number) {
    this.value = value;
  }
  
  public getValue(): number {
    return this.value;
  }
  
  public increment(): void {
    this.value++;
  }
}

/**
 * Интерфейс для паттерна Strategy
 */
export interface IStrategy {
  execute(context: unknown): void;
}

/**
 * Базовый класс для паттерна Decorator
 */
export abstract class ComponentBase {
  public abstract operation(): string;
}

/**
 * Интерфейс для паттерна Factory
 */
export interface IFactory<T> {
  create(): T;
  reset(): void;
}
