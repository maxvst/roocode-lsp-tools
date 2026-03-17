/**
 * Файл с объявлениями классов для тестирования textDocument/declaration
 */

// Простой класс
export class SimpleClass {
    public value: string;
    
    constructor(value: string) {
        this.value = value;
    }
    
    getValue(): string {
        return this.value;
    }
}

// Класс с наследованием
export class ChildClass extends SimpleClass {
    private count: number;
    
    constructor(value: string, count: number) {
        super(value);
        this.count = count;
    }
    
    getCount(): number {
        return this.count;
    }
}

// Класс с интерфейсом
export interface IConfigurable {
    configure(options: Record<string, unknown>): void;
}

export class ConfigurableClass implements IConfigurable {
    private options: Record<string, unknown> = {};
    
    configure(options: Record<string, unknown>): void {
        this.options = { ...options };
    }
    
    getOptions(): Record<string, unknown> {
        return this.options;
    }
}

// Абстрактный класс
export abstract class AbstractBase {
    abstract getName(): string;
    
    describe(): string {
        return `Name: ${this.getName()}`;
    }
}

// Класс с статическими членами
export class StaticClass {
    static instanceCount = 0;
    
    constructor() {
        StaticClass.instanceCount++;
    }
    
    static getInstanceCount(): number {
        return StaticClass.instanceCount;
    }
}

// Обобщённый класс
export class Container<T> {
    private item: T;
    
    constructor(item: T) {
        this.item = item;
    }
    
    getItem(): T {
        return this.item;
    }
    
    setItem(item: T): void {
        this.item = item;
    }
}
