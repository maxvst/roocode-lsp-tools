/**
 * ============================================================================
 * Файл зависимостей для тестирования callHierarchy/outgoingCalls
 * Description: Классы-сервисы, которые вызываются из тестируемых функций
 * ============================================================================
 * 
 * Этот файл содержит классы и сервисы, которые импортируются и вызываются
 * из outgoingCalls.ts для тестирования поиска исходящих вызовов.
 */

// ============================================================================
// ИНТЕРФЕЙСЫ
// ============================================================================

/**
 * Интерфейс для внешнего сервиса
 */
export interface IExternalService {
    connect(): void;
    disconnect(): void;
    fetchData(): string;
    sendData(data: string): boolean;
}

/**
 * Интерфейс для трансформации данных
 */
export interface IDataTransformer {
    transform(input: string): string;
    reverse(input: string): string;
}

/**
 * Интерфейс для валидации
 */
export interface IValidator {
    validate(input: string): boolean;
    getErrors(): string[];
}

// ============================================================================
// КЛАСС ВНЕШНЕГО СЕРВИСА
// ============================================================================

/**
 * Класс внешнего сервиса
 * Используется для тестирования вызовов внешних сервисов
 */
export class ExternalService implements IExternalService {
    private connected: boolean = false;
    private data: string = 'default data';

    /**
     * Подключение к сервису
     * Вызывается из serviceOrchestrator
     */
    public connect(): void {
        this.connected = true;
        console.log('Service connected');
    }

    /**
     * Отключение от сервиса
     * Вызывается из serviceOrchestrator
     */
    public disconnect(): void {
        this.connected = false;
        console.log('Service disconnected');
    }

    /**
     * Получение данных
     * Вызывается из serviceOrchestrator
     */
    public fetchData(): string {
        if (!this.connected) {
            throw new Error('Service not connected');
        }
        return this.data;
    }

    /**
     * Отправка данных
     */
    public sendData(data: string): boolean {
        if (!this.connected) {
            throw new Error('Service not connected');
        }
        this.data = data;
        return true;
    }

    /**
     * Проверка статуса подключения
     */
    public isConnected(): boolean {
        return this.connected;
    }
}

// ============================================================================
// КЛАСС ТРАНСФОРМАЦИИ ДАННЫХ
// ============================================================================

/**
 * Класс для трансформации данных
 * Используется для тестирования вызовов методов трансформации
 */
export class DataTransformer implements IDataTransformer {
    private prefix: string;
    private suffix: string;

    constructor(prefix: string = '', suffix: string = '') {
        this.prefix = prefix;
        this.suffix = suffix;
    }

    /**
     * Трансформация данных
     * Вызывается из serviceOrchestrator
     */
    public transform(input: string): string {
        return `${this.prefix}${input}${this.suffix}`;
    }

    /**
     * Обратная трансформация
     */
    public reverse(input: string): string {
        let result = input;
        if (this.prefix && result.startsWith(this.prefix)) {
            result = result.slice(this.prefix.length);
        }
        if (this.suffix && result.endsWith(this.suffix)) {
            result = result.slice(0, -this.suffix.length);
        }
        return result;
    }

    /**
     * Комбинированная трансформация
     */
    public transformAndReverse(input: string): string {
        const transformed = this.transform(input);
        return this.reverse(transformed);
    }
}

// ============================================================================
// КЛАСС ВАЛИДАТОРА
// ============================================================================

/**
 * Класс для валидации данных
 * Используется для тестирования вызовов методов валидации
 */
export class Validator implements IValidator {
    private errors: string[] = [];
    private minLength: number;
    private maxLength: number;

    constructor(minLength: number = 1, maxLength: number = 100) {
        this.minLength = minLength;
        this.maxLength = maxLength;
    }

    /**
     * Валидация входных данных
     * Вызывается из objectMethodCaller
     */
    public validate(input: string): boolean {
        this.errors = [];

        if (input === null || input === undefined) {
            this.errors.push('Input is null or undefined');
            return false;
        }

        if (input.length < this.minLength) {
            this.errors.push(`Input too short (min: ${this.minLength})`);
        }

        if (input.length > this.maxLength) {
            this.errors.push(`Input too long (max: ${this.maxLength})`);
        }

        return this.errors.length === 0;
    }

    /**
     * Получение списка ошибок
     */
    public getErrors(): string[] {
        return [...this.errors];
    }

    /**
     * Валидация с регулярным выражением
     */
    public validateWithPattern(input: string, pattern: RegExp): boolean {
        const baseValidation = this.validate(input);
        if (!baseValidation) {
            return false;
        }

        if (!pattern.test(input)) {
            this.errors.push('Input does not match pattern');
            return false;
        }

        return true;
    }
}

// ============================================================================
// КЛАСС ОБРАБОТЧИКА ДАННЫХ
// ============================================================================

/**
 * Класс для обработки данных
 */
export class DataProcessor {
    private transformer: DataTransformer;
    private validator: Validator;

    constructor(transformer?: DataTransformer, validator?: Validator) {
        this.transformer = transformer || new DataTransformer();
        this.validator = validator || new Validator();
    }

    /**
     * Обработка данных с валидацией и трансформацией
     */
    public process(input: string): string | null {
        if (!this.validator.validate(input)) {
            return null;
        }
        return this.transformer.transform(input);
    }

    /**
     * Пакетная обработка
     */
    public processBatch(inputs: string[]): (string | null)[] {
        return inputs.map(input => this.process(input));
    }
}

// ============================================================================
// КЛАСС КЭША
// ============================================================================

/**
 * Класс для кэширования данных
 */
export class DataCache {
    private cache: Map<string, { data: string; timestamp: number }>;
    private ttl: number; // Time to live в миллисекундах

    constructor(ttl: number = 60000) {
        this.cache = new Map();
        this.ttl = ttl;
    }

    /**
     * Получение данных из кэша
     */
    public get(key: string): string | null {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }

        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Сохранение данных в кэш
     */
    public set(key: string, data: string): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Очистка кэша
     */
    public clear(): void {
        this.cache.clear();
    }

    /**
     * Проверка наличия ключа
     */
    public has(key: string): boolean {
        return this.get(key) !== null;
    }
}

// ============================================================================
// КЛАСС ЛОГГЕРА
// ============================================================================

/**
 * Класс для логирования
 */
export class Logger {
    private prefix: string;
    private logs: string[];

    constructor(prefix: string = 'Logger') {
        this.prefix = prefix;
        this.logs = [];
    }

    /**
     * Логирование информации
     */
    public info(message: string): void {
        const logEntry = `[${this.prefix}] INFO: ${message}`;
        this.logs.push(logEntry);
        console.log(logEntry);
    }

    /**
     * Логирование ошибки
     */
    public error(message: string): void {
        const logEntry = `[${this.prefix}] ERROR: ${message}`;
        this.logs.push(logEntry);
        console.error(logEntry);
    }

    /**
     * Логирование предупреждения
     */
    public warn(message: string): void {
        const logEntry = `[${this.prefix}] WARN: ${message}`;
        this.logs.push(logEntry);
        console.warn(logEntry);
    }

    /**
     * Получение всех логов
     */
    public getLogs(): string[] {
        return [...this.logs];
    }

    /**
     * Очистка логов
     */
    public clearLogs(): void {
        this.logs = [];
    }
}

// ============================================================================
// ЭКСПОРТ ГОТОВЫХ ЭКЗЕМПЛЯРОВ
// ============================================================================

/**
 * Готовый экземпляр внешнего сервиса
 */
export const defaultExternalService = new ExternalService();

/**
 * Готовый экземпляр трансформатора
 */
export const defaultTransformer = new DataTransformer('[', ']');

/**
 * Готовый экземпляр валидатора
 */
export const defaultValidator = new Validator();

/**
 * Готовый экземпляр обработчика данных
 */
export const defaultDataProcessor = new DataProcessor(
    defaultTransformer,
    defaultValidator
);

/**
 * Готовый экземпляр кэша
 */
export const defaultCache = new DataCache();

/**
 * Готовый экземпляр логгера
 */
export const defaultLogger = new Logger('OutgoingCalls');
