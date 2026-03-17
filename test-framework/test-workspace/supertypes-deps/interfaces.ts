/**
 * Интерфейсы для тестирования typeHierarchy/supertypes
 * Эти интерфейсы используются как родительские типы
 */

/**
 * Базовый интерфейс для демонстрации простого наследования интерфейсов
 */
export interface IBaseInterface {
  id: number;
  getName(): string;
}

/**
 * Интерфейс с методами для сериализации
 */
export interface ISerializable {
  serialize(): string;
  deserialize(data: string): void;
}

/**
 * Интерфейс для сравнения объектов
 */
export interface IComparable<T> {
  compareTo(other: T): number;
  equals(other: T): boolean;
}

/**
 * Интерфейс для клонирования
 */
export interface ICloneable<T> {
  clone(): T;
}

/**
 * Расширенный интерфейс, наследующий от базового
 * IBaseInterface ← IExtendedInterface
 */
export interface IExtendedInterface extends IBaseInterface {
  description: string;
  getDescription(): string;
}

/**
 * Интерфейс с множественным наследованием
 * Объединяет несколько интерфейсов
 */
export interface ICompositeInterface extends ISerializable, IComparable<ICompositeInterface> {
  validate(): boolean;
}

/**
 * Интерфейс для обработчиков событий
 */
export interface IEventHandler {
  handle(event: string): void;
  canHandle(event: string): boolean;
}

/**
 * Интерфейс для паттерна Observer
 */
export interface IObserver<T> {
  update(data: T): void;
}

/**
 * Интерфейс для паттерна Subject
 */
export interface ISubject<T> {
  attach(observer: IObserver<T>): void;
  detach(observer: IObserver<T>): void;
  notify(data: T): void;
}
