/**
 * LSP Method: textDocument/implementation
 * Description: Файл с интерфейсами для тестирования перехода к реализациям
 * 
 * Этот файл содержит интерфейсы и абстрактные классы, которые реализуются
 * в основном тестовом файле implementation.ts
 */

// ============================================================================
// ИНТЕРФЕЙСЫ С НЕСКОЛЬКИМИ РЕАЛИЗАЦИЯМИ
// ============================================================================

/**
 * Test Case: Интерфейс с несколькими реализациями
 * Symbol: IRepository
 * Description: Generic интерфейс репозитория для работы с данными
 * Command: textDocument/implementation на IRepository
 * Expected: UserRepository, ProductRepository, OrderRepository
 */
export interface IRepository<T> {
    getById(id: string): Promise<T | null>;
    getAll(): Promise<T[]>;
    create(entity: T): Promise<T>;
    update(id: string, entity: T): Promise<T>;
    delete(id: string): Promise<boolean>;
}

/**
 * Test Case: Интерфейс с несколькими реализациями (простой)
 * Symbol: ILogger
 * Description: Простой интерфейс логгера
 * Command: textDocument/implementation на ILogger
 * Expected: ConsoleLogger, FileLogger
 */
export interface ILogger {
    log(message: string): void;
    error(message: string): void;
    warn(message: string): void;
}

// ============================================================================
// ИНТЕРФЕЙС С ЕДИНСТВЕННОЙ РЕАЛИЗАЦИЕЙ
// ============================================================================

/**
 * Test Case: Интерфейс с единственной реализацией
 * Symbol: IConfigManager
 * Description: Интерфейс управления конфигурацией
 * Command: textDocument/implementation на IConfigManager
 * Expected: ConfigManager (единственная реализация)
 */
export interface IConfigManager {
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T): void;
    load(path: string): Promise<void>;
    save(path: string): Promise<void>;
}

// ============================================================================
// АБСТРАКТНЫЕ КЛАССЫ С КОНКРЕТНЫМИ НАСЛЕДНИКАМИ
// ============================================================================

/**
 * Test Case: Абстрактный класс с конкретными наследниками
 * Symbol: Animal
 * Description: Абстрактный класс животного
 * Command: textDocument/implementation на Animal
 * Expected: Dog, Cat, Bird
 */
export abstract class Animal {
    constructor(
        protected name: string,
        protected age: number
    ) {}

    abstract makeSound(): void;
    
    move(): void {
        console.log(`${this.name} двигается`);
    }
    
    getName(): string {
        return this.name;
    }
}

/**
 * Test Case: Абстрактный класс с абстрактными методами
 * Symbol: DataProcessor
 * Description: Абстрактный класс обработчика данных
 * Command: textDocument/implementation на DataProcessor
 * Expected: JsonProcessor, XmlProcessor
 */
export abstract class DataProcessor {
    constructor(protected encoding: string = 'utf-8') {}
    
    /**
     * Test Case: Абстрактный метод, переопределённый в наследниках
     * Symbol: DataProcessor.process
     * Description: Абстрактный метод обработки данных
     * Command: textDocument/implementation на process
     * Expected: JsonProcessor.process, XmlProcessor.process
     */
    abstract process(data: string): unknown;
    
    /**
     * Test Case: Абстрактный метод валидации
     * Symbol: DataProcessor.validate
     * Description: Абстрактный метод валидации данных
     * Command: textDocument/implementation на validate
     * Expected: JsonProcessor.validate, XmlProcessor.validate
     */
    abstract validate(data: string): boolean;
    
    // Общий метод для всех наследников
    protected log(message: string): void {
        console.log(`[${this.constructor.name}] ${message}`);
    }
}

// ============================================================================
// ЦЕПОЧКА: ИНТЕРФЕЙС ← АБСТРАКТНЫЙ КЛАСС ← КОНКРЕТНЫЙ КЛАСС
// ============================================================================

/**
 * Test Case: Интерфейс в цепочке наследования
 * Symbol: IStorage
 * Description: Базовый интерфейс хранилища
 * Command: textDocument/implementation на IStorage
 * Expected: AbstractStorage, MemoryStorage, PersistentStorage
 */
export interface IStorage {
    store(key: string, value: unknown): void;
    retrieve(key: string): unknown;
    exists(key: string): boolean;
    clear(): void;
}

/**
 * Test Case: Абстрактный класс, реализующий интерфейс
 * Symbol: AbstractStorage
 * Description: Абстрактная база хранилища с частичной реализацией
 * Command: textDocument/implementation на AbstractStorage
 * Expected: MemoryStorage, PersistentStorage
 */
export abstract class AbstractStorage implements IStorage {
    protected data: Map<string, unknown> = new Map();
    
    abstract store(key: string, value: unknown): void;
    
    retrieve(key: string): unknown {
        return this.data.get(key);
    }
    
    exists(key: string): boolean {
        return this.data.has(key);
    }
    
    clear(): void {
        this.data.clear();
    }
    
    // Дополнительный абстрактный метод
    abstract getStorageType(): string;
}

// ============================================================================
// GENERIC ИНТЕРФЕЙС С РАЗЛИЧНЫМИ РЕАЛИЗАЦИЯМИ
// ============================================================================

/**
 * Test Case: Generic интерфейс с различными реализациями
 * Symbol: IConverter<TInput, TOutput>
 * Description: Generic интерфейс конвертера типов
 * Command: textDocument/implementation на IConverter
 * Expected: StringToNumberConverter, JsonToObjectConverter
 */
export interface IConverter<TInput, TOutput> {
    convert(input: TInput): TOutput;
    canConvert(input: TInput): boolean;
}

/**
 * Test Case: Generic интерфейс с одним параметром
 * Symbol: IValidator<T>
 * Description: Generic интерфейс валидатора
 * Command: textDocument/implementation на IValidator
 * Expected: EmailValidator, AgeValidator
 */
export interface IValidator<T> {
    validate(value: T): boolean;
    getErrorMessage(): string;
}

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ: ИНТЕРФЕЙСЫ БЕЗ РЕАЛИЗАЦИЙ
// ============================================================================

/**
 * Test Case (NEGATIVE): Интерфейс без реализаций
 * Symbol: IPlannedFeature
 * Description: Интерфейс для планируемой функциональности (нет реализаций)
 * Command: textDocument/implementation на IPlannedFeature
 * Expected: Пустой результат (нет реализаций в проекте)
 */
export interface IPlannedFeature {
    enable(): void;
    disable(): void;
    isEnabled(): boolean;
}

/**
 * Test Case (NEGATIVE): Интерфейс только с объявлением
 * Symbol: IFutureApi
 * Description: Интерфейс для будущего API (только объявлен)
 * Command: textDocument/implementation на IFutureApi
 * Expected: Пустой результат
 */
export interface IFutureApi {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    fetchData(): Promise<unknown[]>;
}

// ============================================================================
// АБСТРАКТНЫЙ КЛАСС ДЛЯ ТЕСТИРОВАНИЯ SEALED/FINAL ПОВЕДЕНИЯ
// ============================================================================

/**
 * Test Case: Абстрактный класс с "финальными" методами
 * Symbol: BaseService
 * Description: Базовый сервис с методами, которые не должны переопределяться
 * Command: textDocument/implementation на BaseService
 * Expected: UserService, ProductService
 */
export abstract class BaseService {
    private static instances: number = 0;
    
    constructor() {
        BaseService.instances++;
    }
    
    // "Финальный" метод - не абстрактный, не должен переопределяться
    getServiceId(): string {
        return `${this.constructor.name}-${BaseService.instances}`;
    }
    
    // Абстрактный метод для переопределения
    abstract execute(): void;
    
    // Статический метод
    static getInstanceCount(): number {
        return BaseService.instances;
    }
}
