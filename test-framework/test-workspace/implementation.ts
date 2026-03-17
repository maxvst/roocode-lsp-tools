/**
 * ============================================================================
 * LSP Method: textDocument/implementation
 * Description: Переход к реализациям интерфейса или абстрактного класса
 * ============================================================================
 * 
 * Этот файл содержит тестовые сценарии для метода textDocument/implementation.
 * Метод позволяет найти все реализации интерфейса или наследники абстрактного класса.
 * 
 * Импортируемые символы из implementation-deps/interfaces.ts:
 * - IRepository, ILogger, IConfigManager (интерфейсы)
 * - Animal, DataProcessor (абстрактные классы)
 * - IStorage, AbstractStorage (цепочка наследования)
 * - IConverter, IValidator (generic интерфейсы)
 * - IPlannedFeature, IFutureApi (интерфейсы без реализаций)
 * - BaseService (абстрактный класс)
 */

import {
    IRepository,
    ILogger,
    IConfigManager,
    Animal,
    DataProcessor,
    IStorage,
    AbstractStorage,
    IConverter,
    IValidator,
    IPlannedFeature,
    IFutureApi,
    BaseService,
} from './implementation-deps/interfaces';

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ИНТЕРФЕЙС С НЕСКОЛЬКИМИ РЕАЛИЗАЦИЯМИ
// ============================================================================

/**
 * Test Case 1: Интерфейс с несколькими реализациями (Repository)
 * Symbol: IRepository (из interfaces.ts)
 * Description: Generic интерфейс репозитория с несколькими реализациями
 * Command: textDocument/implementation на IRepository в строке импорта
 * Expected: UserRepository, ProductRepository, OrderRepository
 * 
 * Примечание: Выполните Go to Implementation на IRepository в строке:
 * import { IRepository } from './implementation-deps/interfaces';
 */

/**
 * Test Case 1.1: Реализация IRepository для пользователей
 * Symbol: UserRepository
 * Description: Конкретная реализация репозитория пользователей
 * Implements: IRepository<User>
 */
interface User {
    id: string;
    name: string;
    email: string;
}

export class UserRepository implements IRepository<User> {
    private users: Map<string, User> = new Map();

    async getById(id: string): Promise<User | null> {
        return this.users.get(id) || null;
    }

    async getAll(): Promise<User[]> {
        return Array.from(this.users.values());
    }

    async create(entity: User): Promise<User> {
        this.users.set(entity.id, entity);
        return entity;
    }

    async update(id: string, entity: User): Promise<User> {
        this.users.set(id, entity);
        return entity;
    }

    async delete(id: string): Promise<boolean> {
        return this.users.delete(id);
    }
}

/**
 * Test Case 1.2: Реализация IRepository для продуктов
 * Symbol: ProductRepository
 * Description: Конкретная реализация репозитория продуктов
 * Implements: IRepository<Product>
 */
interface Product {
    id: string;
    name: string;
    price: number;
}

export class ProductRepository implements IRepository<Product> {
    private products: Map<string, Product> = new Map();

    async getById(id: string): Promise<Product | null> {
        return this.products.get(id) || null;
    }

    async getAll(): Promise<Product[]> {
        return Array.from(this.products.values());
    }

    async create(entity: Product): Promise<Product> {
        this.products.set(entity.id, entity);
        return entity;
    }

    async update(id: string, entity: Product): Promise<Product> {
        this.products.set(id, entity);
        return entity;
    }

    async delete(id: string): Promise<boolean> {
        return this.products.delete(id);
    }
}

/**
 * Test Case 1.3: Реализация IRepository для заказов
 * Symbol: OrderRepository
 * Description: Конкретная реализация репозитория заказов
 * Implements: IRepository<Order>
 */
interface Order {
    id: string;
    userId: string;
    productId: string;
    quantity: number;
}

export class OrderRepository implements IRepository<Order> {
    private orders: Map<string, Order> = new Map();

    async getById(id: string): Promise<Order | null> {
        return this.orders.get(id) || null;
    }

    async getAll(): Promise<Order[]> {
        return Array.from(this.orders.values());
    }

    async create(entity: Order): Promise<Order> {
        this.orders.set(entity.id, entity);
        return entity;
    }

    async update(id: string, entity: Order): Promise<Order> {
        this.orders.set(id, entity);
        return entity;
    }

    async delete(id: string): Promise<boolean> {
        return this.orders.delete(id);
    }
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ИНТЕРФЕЙС С НЕСКОЛЬКИМИ РЕАЛИЗАЦИЯМИ (ПРОСТОЙ)
// ============================================================================

/**
 * Test Case 2: Интерфейс с несколькими реализациями (Logger)
 * Symbol: ILogger (из interfaces.ts)
 * Description: Простой интерфейс логгера с двумя реализациями
 * Command: textDocument/implementation на ILogger в строке импорта
 * Expected: ConsoleLogger, FileLogger
 */

/**
 * Test Case 2.1: Реализация ILogger для консоли
 * Symbol: ConsoleLogger
 * Description: Логгер, выводящий сообщения в консоль
 * Implements: ILogger
 */
export class ConsoleLogger implements ILogger {
    log(message: string): void {
        console.log(`[LOG] ${message}`);
    }

    error(message: string): void {
        console.error(`[ERROR] ${message}`);
    }

    warn(message: string): void {
        console.warn(`[WARN] ${message}`);
    }
}

/**
 * Test Case 2.2: Реализация ILogger для файла
 * Symbol: FileLogger
 * Description: Логгер, записывающий сообщения в файл
 * Implements: ILogger
 */
export class FileLogger implements ILogger {
    constructor(private filePath: string) {}

    log(message: string): void {
        this.writeToFile(`[LOG] ${message}`);
    }

    error(message: string): void {
        this.writeToFile(`[ERROR] ${message}`);
    }

    warn(message: string): void {
        this.writeToFile(`[WARN] ${message}`);
    }

    private writeToFile(message: string): void {
        // Имитация записи в файл
        console.log(`Writing to ${this.filePath}: ${message}`);
    }
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ИНТЕРФЕЙС С ЕДИНСТВЕННОЙ РЕАЛИЗАЦИЕЙ
// ============================================================================

/**
 * Test Case 3: Интерфейс с единственной реализацией
 * Symbol: IConfigManager (из interfaces.ts)
 * Description: Интерфейс управления конфигурацией с одной реализацией
 * Command: textDocument/implementation на IConfigManager в строке импорта
 * Expected: ConfigManager (единственная реализация)
 */

/**
 * Test Case 3.1: Единственная реализация IConfigManager
 * Symbol: ConfigManager
 * Description: Менеджер конфигурации приложения
 * Implements: IConfigManager
 */
export class ConfigManager implements IConfigManager {
    private config: Map<string, unknown> = new Map();

    get<T>(key: string): T | undefined {
        return this.config.get(key) as T | undefined;
    }

    set<T>(key: string, value: T): void {
        this.config.set(key, value);
    }

    async load(path: string): Promise<void> {
        // Имитация загрузки конфигурации
        console.log(`Loading config from ${path}`);
    }

    async save(path: string): Promise<void> {
        // Имитация сохранения конфигурации
        console.log(`Saving config to ${path}`);
    }
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: АБСТРАКТНЫЙ КЛАСС С КОНКРЕТНЫМИ НАСЛЕДНИКАМИ
// ============================================================================

/**
 * Test Case 4: Абстрактный класс с конкретными наследниками (Animal)
 * Symbol: Animal (из interfaces.ts)
 * Description: Абстрактный класс животного с тремя наследниками
 * Command: textDocument/implementation на Animal в строке импорта
 * Expected: Dog, Cat, Bird
 */

/**
 * Test Case 4.1: Конкретный наследник Animal - Dog
 * Symbol: Dog
 * Description: Реализация собаки
 * Extends: Animal
 */
export class Dog extends Animal {
    private breed: string;

    constructor(name: string, age: number, breed: string) {
        super(name, age);
        this.breed = breed;
    }

    makeSound(): void {
        console.log(`${this.getName()} лает: Гав-гав!`);
    }

    fetch(): void {
        console.log(`${this.getName()} приносит мяч`);
    }
}

/**
 * Test Case 4.2: Конкретный наследник Animal - Cat
 * Symbol: Cat
 * Description: Реализация кошки
 * Extends: Animal
 */
export class Cat extends Animal {
    private indoor: boolean;

    constructor(name: string, age: number, indoor: boolean) {
        super(name, age);
        this.indoor = indoor;
    }

    makeSound(): void {
        console.log(`${this.getName()} мяукает: Мяу!`);
    }

    climb(): void {
        console.log(`${this.getName()} лазает по деревьям`);
    }
}

/**
 * Test Case 4.3: Конкретный наследник Animal - Bird
 * Symbol: Bird
 * Description: Реализация птицы
 * Extends: Animal
 */
export class Bird extends Animal {
    private canFly: boolean;

    constructor(name: string, age: number, canFly: boolean) {
        super(name, age);
        this.canFly = canFly;
    }

    makeSound(): void {
        console.log(`${this.getName()} чирикает: Чик-чирик!`);
    }

    fly(): void {
        if (this.canFly) {
            console.log(`${this.getName()} летит`);
        } else {
            console.log(`${this.getName()} не умеет летать`);
        }
    }
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: АБСТРАКТНЫЙ КЛАСС С АБСТРАКТНЫМИ МЕТОДАМИ
// ============================================================================

/**
 * Test Case 5: Абстрактный класс DataProcessor с наследниками
 * Symbol: DataProcessor (из interfaces.ts)
 * Description: Абстрактный обработчик данных с конкретными реализациями
 * Command: textDocument/implementation на DataProcessor в строке импорта
 * Expected: JsonProcessor, XmlProcessor
 */

/**
 * Test Case 5.1: Обработчик JSON данных
 * Symbol: JsonProcessor
 * Description: Процессор для обработки JSON данных
 * Extends: DataProcessor
 */
export class JsonProcessor extends DataProcessor {
    process(data: string): unknown {
        try {
            return JSON.parse(data);
        } catch (e) {
            this.log(`Ошибка парсинга JSON: ${e}`);
            return null;
        }
    }

    validate(data: string): boolean {
        try {
            JSON.parse(data);
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * Test Case 5.2: Обработчик XML данных
 * Symbol: XmlProcessor
 * Description: Процессор для обработки XML данных
 * Extends: DataProcessor
 */
export class XmlProcessor extends DataProcessor {
    process(data: string): unknown {
        // Упрощенная обработка XML
        this.log('Обработка XML данных');
        return { rawXml: data };
    }

    validate(data: string): boolean {
        // Упрощенная валидация XML
        return data.startsWith('<') && data.endsWith('>');
    }
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ЦЕПОЧКА НАСЛЕДОВАНИЯ
// ============================================================================

/**
 * Test Case 6: Цепочка интерфейс ← абстрактный класс ← конкретный класс
 * Symbol: IStorage (из interfaces.ts)
 * Description: Интерфейс в начале цепочки наследования
 * Command: textDocument/implementation на IStorage в строке импорта
 * Expected: AbstractStorage, MemoryStorage, PersistentStorage
 * 
 * Symbol: AbstractStorage (из interfaces.ts)
 * Description: Абстрактный класс в середине цепочки
 * Command: textDocument/implementation на AbstractStorage в строке импорта
 * Expected: MemoryStorage, PersistentStorage
 */

/**
 * Test Case 6.1: Конкретная реализация хранилища в памяти
 * Symbol: MemoryStorage
 * Description: Хранилище данных в оперативной памяти
 * Extends: AbstractStorage
 */
export class MemoryStorage extends AbstractStorage {
    store(key: string, value: unknown): void {
        this.data.set(key, value);
        console.log(`Сохранено в памяти: ${key}`);
    }

    getStorageType(): string {
        return 'Memory Storage';
    }

    // Дополнительный метод для MemoryStorage
    getSize(): number {
        return this.data.size;
    }
}

/**
 * Test Case 6.2: Конкретная реализация персистентного хранилища
 * Symbol: PersistentStorage
 * Description: Хранилище данных с сохранением на диск
 * Extends: AbstractStorage
 */
export class PersistentStorage extends AbstractStorage {
    private storagePath: string;

    constructor(storagePath: string) {
        super();
        this.storagePath = storagePath;
    }

    store(key: string, value: unknown): void {
        this.data.set(key, value);
        this.persistToDisk(key, value);
    }

    getStorageType(): string {
        return `Persistent Storage (${this.storagePath})`;
    }

    private persistToDisk(key: string, value: unknown): void {
        console.log(`Сохранение на диск: ${key} = ${JSON.stringify(value)}`);
    }
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: GENERIC ИНТЕРФЕЙСЫ
// ============================================================================

/**
 * Test Case 7: Generic интерфейс IConverter с различными реализациями
 * Symbol: IConverter (из interfaces.ts)
 * Description: Generic интерфейс конвертера типов
 * Command: textDocument/implementation на IConverter в строке импорта
 * Expected: StringToNumberConverter, JsonToObjectConverter
 */

/**
 * Test Case 7.1: Конвертер строки в число
 * Symbol: StringToNumberConverter
 * Description: Конвертирует строковые представления чисел
 * Implements: IConverter<string, number>
 */
export class StringToNumberConverter implements IConverter<string, number> {
    convert(input: string): number {
        return parseFloat(input);
    }

    canConvert(input: string): boolean {
        return !isNaN(parseFloat(input));
    }
}

/**
 * Test Case 7.2: Конвертер JSON в объект
 * Symbol: JsonToObjectConverter
 * Description: Конвертирует JSON строки в объекты
 * Implements: IConverter<string, Record<string, unknown>>
 */
export class JsonToObjectConverter implements IConverter<string, Record<string, unknown>> {
    convert(input: string): Record<string, unknown> {
        return JSON.parse(input);
    }

    canConvert(input: string): boolean {
        try {
            JSON.parse(input);
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * Test Case 8: Generic интерфейс IValidator с различными реализациями
 * Symbol: IValidator (из interfaces.ts)
 * Description: Generic интерфейс валидатора
 * Command: textDocument/implementation на IValidator в строке импорта
 * Expected: EmailValidator, AgeValidator
 */

/**
 * Test Case 8.1: Валидатор email
 * Symbol: EmailValidator
 * Description: Валидирует строку как email адрес
 * Implements: IValidator<string>
 */
export class EmailValidator implements IValidator<string> {
    private errorMessage: string = '';

    validate(value: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(value);
        
        if (!isValid) {
            this.errorMessage = 'Некорректный формат email';
        }
        
        return isValid;
    }

    getErrorMessage(): string {
        return this.errorMessage;
    }
}

/**
 * Test Case 8.2: Валидатор возраста
 * Symbol: AgeValidator
 * Description: Валидирует число как возраст человека
 * Implements: IValidator<number>
 */
export class AgeValidator implements IValidator<number> {
    private errorMessage: string = '';

    validate(value: number): boolean {
        if (value < 0) {
            this.errorMessage = 'Возраст не может быть отрицательным';
            return false;
        }
        
        if (value > 150) {
            this.errorMessage = 'Некорректный возраст';
            return false;
        }
        
        return true;
    }

    getErrorMessage(): string {
        return this.errorMessage;
    }
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: АБСТРАКТНЫЙ КЛАСС С "ФИНАЛЬНЫМИ" МЕТОДАМИ
// ============================================================================

/**
 * Test Case 9: Абстрактный класс BaseService с наследниками
 * Symbol: BaseService (из interfaces.ts)
 * Description: Базовый сервис с наследниками
 * Command: textDocument/implementation на BaseService в строке импорта
 * Expected: UserService, ProductService
 */

/**
 * Test Case 9.1: Сервис пользователей
 * Symbol: UserService
 * Description: Сервис для работы с пользователями
 * Extends: BaseService
 */
export class UserService extends BaseService {
    private users: Map<string, User> = new Map();

    execute(): void {
        console.log('Выполнение операций с пользователями');
    }

    addUser(user: User): void {
        this.users.set(user.id, user);
    }

    getUser(id: string): User | undefined {
        return this.users.get(id);
    }
}

/**
 * Test Case 9.2: Сервис продуктов
 * Symbol: ProductService
 * Description: Сервис для работы с продуктами
 * Extends: BaseService
 */
export class ProductService extends BaseService {
    private products: Map<string, Product> = new Map();

    execute(): void {
        console.log('Выполнение операций с продуктами');
    }

    addProduct(product: Product): void {
        this.products.set(product.id, product);
    }

    getProduct(id: string): Product | undefined {
        return this.products.get(id);
    }
}

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ: ОБЫЧНЫЙ КЛАСС БЕЗ НАСЛЕДНИКОВ
// ============================================================================

/**
 * Test Case 10 (NEGATIVE): Обычный класс без наследников
 * Symbol: StandaloneClass
 * Description: Обычный класс, который никто не наследует
 * Command: textDocument/implementation на StandaloneClass
 * Expected: Пустой результат (нет наследников)
 * 
 * Примечание: Это НЕ абстрактный класс и НЕ интерфейс,
 * поэтому implementation не должен ничего возвращать.
 */
export class StandaloneClass {
    private value: number;

    constructor(value: number) {
        this.value = value;
    }

    getValue(): number {
        return this.value;
    }

    setValue(value: number): void {
        this.value = value;
    }
}

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ: ИНТЕРФЕЙС БЕЗ РЕАЛИЗАЦИЙ
// ============================================================================

/**
 * Test Case 11 (NEGATIVE): Интерфейс без реализаций
 * Symbol: IPlannedFeature (из interfaces.ts)
 * Description: Интерфейс для планируемой функциональности
 * Command: textDocument/implementation на IPlannedFeature в строке импорта
 * Expected: Пустой результат (интерфейс объявлен, но не реализован)
 * 
 * Примечание: Интерфейс существует, но нет ни одного класса,
 * который его реализует.
 */

/**
 * Test Case 12 (NEGATIVE): Интерфейс только с объявлением
 * Symbol: IFutureApi (из interfaces.ts)
 * Description: Интерфейс для будущего API
 * Command: textDocument/implementation на IFutureApi в строке импорта
 * Expected: Пустой результат
 */

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ: ПРИМИТИВНЫЕ ТИПЫ И ПЕРЕМЕННЫЕ
// ============================================================================

/**
 * Test Case 13 (NEGATIVE): Примитивный тип
 * Symbol: string, number, boolean
 * Description: Примитивные типы TypeScript
 * Command: textDocument/implementation на примитивных типах
 * Expected: Не применимо (примитивные типы не имеют реализаций)
 */
const primitiveString: string = 'test';
const primitiveNumber: number = 42;
const primitiveBoolean: boolean = true;

/**
 * Test Case 14 (NEGATIVE): Переменная
 * Symbol: unusedVariable
 * Description: Обычная переменная
 * Command: textDocument/implementation на переменной
 * Expected: Не применимо (переменные не имеют реализаций)
 */
const unusedVariable = 'Эта переменная никуда не ссылается';

/**
 * Test Case 15 (NEGATIVE): Функция
 * Symbol: standaloneFunction
 * Description: Обычная функция
 * Command: textDocument/implementation на функции
 * Expected: Не применимо (функции не имеют реализаций в смысле LSP)
 */
function standaloneFunction(param: string): number {
    return param.length;
}

// ============================================================================
// ДОПОЛНИТЕЛЬНЫЕ ТЕСТОВЫЕ СЛУЧАИ
// ============================================================================

/**
 * Test Case 16: Множественное наследование интерфейсов
 * Symbol: ICombinedInterface
 * Description: Интерфейс, объединяющий несколько других
 * Command: textDocument/implementation на ICombinedInterface
 * Expected: CombinedImplementation
 */
interface IReadable {
    read(): string;
}

interface IWritable {
    write(data: string): void;
}

interface ICombinedInterface extends IReadable, IWritable {
    clear(): void;
}

/**
 * Test Case 16.1: Реализация объединённого интерфейса
 * Symbol: CombinedImplementation
 * Description: Класс, реализующий объединённый интерфейс
 * Implements: ICombinedInterface
 */
export class CombinedImplementation implements ICombinedInterface {
    private data: string = '';

    read(): string {
        return this.data;
    }

    write(data: string): void {
        this.data = data;
    }

    clear(): void {
        this.data = '';
    }
}

/**
 * Test Case 17: Класс с приватным наследованием (имитация sealed)
 * Symbol: SealedClass
 * Description: Класс, который "запечатан" через приватный конструктор
 * Command: textDocument/implementation на SealedClass
 * Expected: Пустой результат (нельзя наследовать)
 * 
 * Примечание: В TypeScript нет ключевого слова sealed, но можно
 * использовать приватный конструктор для предотвращения наследования.
 */
export class SealedClass {
    private constructor(private value: string) {}

    getValue(): string {
        return this.value;
    }

    static create(value: string): SealedClass {
        return new SealedClass(value);
    }
}

// ============================================================================
// ЭКСПОРТ ДЛЯ ИСПОЛЬЗОВАНИЯ В ДРУГИХ ТЕСТАХ
// ============================================================================

export {
    IPlannedFeature,
    IFutureApi,
};
