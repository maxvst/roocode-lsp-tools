/**
 * Файл с определениями классов для тестирования textDocument/typeDefinition
 */

// Базовый класс для типа
export class EntityClass {
    public id: number;
    
    constructor(id: number) {
        this.id = id;
    }
    
    getId(): number {
        return this.id;
    }
}

// Класс для пользователя
export class UserClass {
    constructor(
        public id: number,
        public name: string,
        public email: string
    ) {}
    
    getDisplayName(): string {
        return `${this.name} <${this.email}>`;
    }
}

// Класс с обобщённым типом
export class ContainerClass<T> {
    private value: T;
    
    constructor(value: T) {
        this.value = value;
    }
    
    getValue(): T {
        return this.value;
    }
    
    setValue(value: T): void {
        this.value = value;
    }
}

// Класс для результата операции
export class ResultClass<T, E = Error> {
    private constructor(
        private readonly _success: boolean,
        private readonly _value?: T,
        private readonly _error?: E
    ) {}
    
    static success<T, E = Error>(value: T): ResultClass<T, E> {
        return new ResultClass<T, E>(true, value);
    }
    
    static failure<T, E = Error>(error: E): ResultClass<T, E> {
        return new ResultClass<T, E>(false, undefined, error);
    }
    
    isSuccess(): boolean {
        return this._success;
    }
    
    getValue(): T | undefined {
        return this._value;
    }
    
    getError(): E | undefined {
        return this._error;
    }
}

// Абстрактный класс для обработчиков
export abstract class HandlerClass<TInput, TOutput> {
    abstract handle(input: TInput): TOutput;
    
    protected log(message: string): void {
        console.log(`[${this.constructor.name}] ${message}`);
    }
}

// Конкретный обработчик
export class StringHandlerClass extends HandlerClass<string, string> {
    handle(input: string): string {
        this.log(`Processing: ${input}`);
        return input.toUpperCase();
    }
}

// Класс с интерфейсом
export interface ISerializable {
    serialize(): string;
    deserialize(data: string): void;
}

export class SerializableClass implements ISerializable {
    constructor(public data: Record<string, unknown>) {}
    
    serialize(): string {
        return JSON.stringify(this.data);
    }
    
    deserialize(data: string): void {
        this.data = JSON.parse(data);
    }
}

// Класс для события
export class EventClass<TPayload = unknown> {
    private listeners: Array<(payload: TPayload) => void> = [];
    
    subscribe(listener: (payload: TPayload) => void): void {
        this.listeners.push(listener);
    }
    
    emit(payload: TPayload): void {
        this.listeners.forEach(listener => listener(payload));
    }
}

// Класс-перечисление (enum-like class)
export class HttpStatusClass {
    static readonly OK = new HttpStatusClass(200, "OK");
    static readonly NotFound = new HttpStatusClass(404, "Not Found");
    static readonly InternalServerError = new HttpStatusClass(500, "Internal Server Error");
    
    private constructor(
        public readonly code: number,
        public readonly message: string
    ) {}
    
    toString(): string {
        return `${this.code} ${this.message}`;
    }
}
