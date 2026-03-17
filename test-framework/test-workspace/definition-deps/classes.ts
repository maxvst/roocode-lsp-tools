/**
 * Файл с определениями классов и интерфейсов для тестирования textDocument/definition
 */

// Базовый интерфейс
export interface IDefinitionInterface {
    id: string;
    name: string;
    getValue(): string;
}

// Интерфейс с наследованием
export interface IExtendedInterface extends IDefinitionInterface {
    timestamp: number;
    metadata?: Record<string, unknown>;
}

// Простой класс
export class DefinitionClass {
    private _value: string;
    public readonly id: string;
    
    constructor(value: string, id: string) {
        this._value = value;
        this.id = id;
    }
    
    get value(): string {
        return this._value;
    }
    
    set value(newValue: string) {
        this._value = newValue;
    }
    
    getValue(): string {
        return this._value;
    }
}

// Класс, реализующий интерфейс
export class ImplementingClass implements IDefinitionInterface {
    id: string;
    name: string;
    
    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
    
    getValue(): string {
        return `${this.id}: ${this.name}`;
    }
}

// Класс с наследованием
export class ParentClass {
    protected familyName: string;
    
    constructor(familyName: string) {
        this.familyName = familyName;
    }
    
    getFamilyName(): string {
        return this.familyName;
    }
}

export class ChildDefinitionClass extends ParentClass {
    private firstName: string;
    
    constructor(firstName: string, familyName: string) {
        super(familyName);
        this.firstName = firstName;
    }
    
    getFullName(): string {
        return `${this.firstName} ${this.familyName}`;
    }
}

// Абстрактный класс
export abstract class AbstractDefinitionClass {
    abstract getName(): string;
    
    describe(): string {
        return `This is ${this.getName()}`;
    }
}

// Обобщённый класс
export class GenericContainer<T> {
    private items: T[] = [];
    
    add(item: T): void {
        this.items.push(item);
    }
    
    get(index: number): T | undefined {
        return this.items[index];
    }
    
    getAll(): T[] {
        return [...this.items];
    }
}

// Класс с статическими членами
export class FactoryClass {
    private static instance: FactoryClass | null = null;
    private created: number = 0;
    
    private constructor() {}
    
    static getInstance(): FactoryClass {
        if (!FactoryClass.instance) {
            FactoryClass.instance = new FactoryClass();
        }
        return FactoryClass.instance;
    }
    
    create(): number {
        return ++this.created;
    }
}

// Декоратор класса (пример)
export function sealed(constructor: Function): void {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}

@sealed
export class DecoratedClass {
    public value: string;
    
    constructor(value: string) {
        this.value = value;
    }
}
