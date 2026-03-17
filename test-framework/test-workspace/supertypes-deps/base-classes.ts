/**
 * Базовые классы для тестирования typeHierarchy/supertypes
 * Эти классы используются как родительские в тестах
 */

/**
 * Базовый класс без явного наследования
 * Используется для тестирования простого наследования
 */
export class BaseClass {
  protected name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  public getName(): string {
    return this.name;
  }
  
  public baseMethod(): void {
    console.log('Base method');
  }
}

/**
 * Корневой класс иерархии
 * Используется для тестирования цепочки наследования
 */
export class RootClass {
  protected id: number;
  
  constructor(id: number) {
    this.id = id;
  }
  
  public getId(): number {
    return this.id;
  }
}

/**
 * Промежуточный класс в цепочке наследования
 * RootClass ← MiddleClass ← ...
 */
export class MiddleClass extends RootClass {
  protected description: string;
  
  constructor(id: number, description: string) {
    super(id);
    this.description = description;
  }
  
  public getDescription(): string {
    return this.description;
  }
}

/**
 * Абстрактный базовый класс
 * Используется для тестирования наследования от абстрактных классов
 */
export abstract class AbstractEntity {
  abstract readonly type: string;
  
  abstract validate(): boolean;
  
  public toString(): string {
    return `Entity of type: ${this.type}`;
  }
}
