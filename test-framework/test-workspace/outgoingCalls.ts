/**
 * ============================================================================
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * ============================================================================
 * 
 * Этот файл содержит тестовые сценарии для проверки LSP-метода
 * callHierarchy/outgoingCalls, который находит все функции и методы,
 * которые вызывает данная функция.
 */

import {
    helperFunctionA,
    helperFunctionB,
    helperFunctionC,
    utilityLog,
    utilityFormat,
    validateInput,
    processData
} from './outgoingCalls-deps/targets';
import {
    ExternalService,
    DataTransformer,
    Validator
} from './outgoingCalls-deps/services';

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ
// ============================================================================

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 1: Функция, вызывающая несколько других функций
 * Symbol: mainProcessor (позиция: строка ~35)
 * Command: callHierarchy/outgoingCalls
 * Expected:
 *   - helperFunctionA() - первый вызов
 *   - helperFunctionB() - второй вызов
 *   - helperFunctionC() - третий вызов
 *   - utilityLog() - логирование результата
 */
export function mainProcessor(input: string): string {
    const step1 = helperFunctionA(input);
    const step2 = helperFunctionB(step1);
    const step3 = helperFunctionC(step2);
    utilityLog(`Processing completed: ${step3}`);
    return step3;
}

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 2: Метод, вызывающий другие методы того же класса
 * Symbol: WorkflowManager.executeWorkflow (позиция: строка ~58)
 * Command: callHierarchy/outgoingCalls
 * Expected:
 *   - this.initialize() - инициализация
 *   - this.validate() - валидация
 *   - this.process() - обработка
 *   - this.cleanup() - очистка
 */
export class WorkflowManager {
    private data: string;

    constructor(initialData: string) {
        this.data = initialData;
    }

    public executeWorkflow(): string {
        this.initialize();
        this.validate();
        const result = this.process();
        this.cleanup();
        return result;
    }

    private initialize(): void {
        this.data = `init:${this.data}`;
    }

    private validate(): boolean {
        return this.data.length > 0;
    }

    private process(): string {
        return `processed:${this.data}`;
    }

    private cleanup(): void {
        this.data = '';
    }
}

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 3: Функция с цепочкой вызовов (A → B → C)
 * Symbol: chainCaller (позиция: строка ~105)
 * Command: callHierarchy/outgoingCalls
 * Expected:
 *   - chainStepA() - первый шаг цепочки
 *   - chainStepB() - второй шаг цепочки
 *   - chainStepC() - третий шаг цепочки
 */
export function chainCaller(value: number): number {
    const a = chainStepA(value);
    const b = chainStepB(a);
    const c = chainStepC(b);
    return c;
}

function chainStepA(n: number): number {
    return n + 1;
}

function chainStepB(n: number): number {
    return n * 2;
}

function chainStepC(n: number): number {
    return n - 1;
}

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 4: Функция с условными вызовами
 * Symbol: conditionalProcessor (позиция: строка ~138)
 * Command: callHierarchy/outgoingCalls
 * Expected:
 *   - validateInput() - валидация входных данных
 *   - helperFunctionA() - вызывается при условии true
 *   - helperFunctionB() - вызывается при условии false
 *   - utilityFormat() - форматирование результата
 */
export function conditionalProcessor(input: string, condition: boolean): string {
    if (!validateInput(input)) {
        return 'Invalid input';
    }

    let result: string;
    if (condition) {
        result = helperFunctionA(input);
    } else {
        result = helperFunctionB(input);
    }

    return utilityFormat(result);
}

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 5: Конструктор, вызывающий другие методы
 * Symbol: DataContainer.constructor (позиция: строка ~168)
 * Command: callHierarchy/outgoingCalls
 * Expected:
 *   - this.initializeDefaults() - инициализация значений по умолчанию
 *   - this.validateConfiguration() - валидация конфигурации
 */
export class DataContainer {
    private data: string;
    private config: { timeout: number; retries: number; debug: boolean };

    constructor(initialData?: string) {
        this.data = initialData || '';
        this.config = { timeout: 0, retries: 0, debug: false };
        this.initializeDefaults();
        this.validateConfiguration();
    }

    private initializeDefaults(): void {
        this.config = {
            timeout: 1000,
            retries: 3,
            debug: false
        };
    }

    private validateConfiguration(): boolean {
        return this.config.timeout > 0 && this.config.retries >= 0;
    }

    public getData(): string {
        return this.data;
    }
}

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 6: Функция с вызовами внешних сервисов
 * Symbol: serviceOrchestrator (позиция: строка ~209)
 * Command: callHierarchy/outgoingCalls
 * Expected:
 *   - ExternalService.connect() - подключение к сервису
 *   - ExternalService.fetchData() - получение данных
 *   - DataTransformer.transform() - трансформация данных
 *   - ExternalService.disconnect() - отключение от сервиса
 */
export function serviceOrchestrator(service: ExternalService, transformer: DataTransformer): string {
    service.connect();
    const rawData = service.fetchData();
    const transformed = transformer.transform(rawData);
    service.disconnect();
    return transformed;
}

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 7: Функция с циклом и вызовами внутри
 * Symbol: loopProcessor (позиция: строка ~230)
 * Command: callHierarchy/outgoingCalls
 * Expected:
 *   - validateInput() - валидация каждого элемента
 *   - processData() - обработка валидных данных
 *   - utilityLog() - логирование прогресса
 */
export function loopProcessor(items: string[]): string[] {
    const results: string[] = [];

    for (const item of items) {
        if (validateInput(item)) {
            const processed = processData(item);
            results.push(processed);
            utilityLog(`Processed: ${item}`);
        }
    }

    return results;
}

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 8: Асинхронная функция с вызовами
 * Symbol: asyncProcessor (позиция: строка ~258)
 * Command: callHierarchy/outgoingCalls
 * Expected:
 *   - asyncValidate() - асинхронная валидация
 *   - asyncFetch() - асинхронное получение данных
 *   - asyncSave() - асинхронное сохранение
 */
export async function asyncProcessor(id: string): Promise<string> {
    const isValid = await asyncValidate(id);
    if (!isValid) {
        throw new Error('Invalid ID');
    }

    const data = await asyncFetch(id);
    const result = await asyncSave(data);
    return result;
}

async function asyncValidate(id: string): Promise<boolean> {
    return id.length > 0;
}

async function asyncFetch(id: string): Promise<string> {
    return `Data for ${id}`;
}

async function asyncSave(data: string): Promise<string> {
    return `Saved: ${data}`;
}

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 9: Метод с вызовами статических методов
 * Symbol: StaticCaller.run (позиция: строка ~296)
 * Command: callHierarchy/outgoingCalls
 * Expected:
 *   - StaticHelper.initialize() - статическая инициализация
 *   - StaticHelper.process() - статическая обработка
 *   - StaticHelper.cleanup() - статическая очистка
 */
export class StaticCaller {
    public run(input: string): string {
        StaticHelper.initialize();
        const result = StaticHelper.process(input);
        StaticHelper.cleanup();
        return result;
    }
}

class StaticHelper {
    public static initialize(): void {
        console.log('Initialized');
    }

    public static process(input: string): string {
        return `Processed: ${input}`;
    }

    public static cleanup(): void {
        console.log('Cleaned up');
    }
}

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 10: Функция с вызовами через объект
 * Symbol: objectMethodCaller (позиция: строка ~329)
 * Command: callHierarchy/outgoingCalls
 * Expected:
 *   - validator.validate() - вызов метода через объект
 *   - transformer.transform() - вызов метода через объект
 */
export function objectMethodCaller(
    validator: Validator,
    transformer: DataTransformer,
    input: string
): string | null {
    if (validator.validate(input)) {
        return transformer.transform(input);
    }
    return null;
}

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ
// ============================================================================

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 11 (NEGATIVE): Пустая функция без вызовов
 * Symbol: emptyFunction (позиция: строка ~356)
 * Command: callHierarchy/outgoingCalls
 * Expected: Пустой результат (нет исходящих вызовов)
 */
export function emptyFunction(): void {
    // Эта функция ничего не делает и никого не вызывает
}

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 12 (NEGATIVE): Функция, содержащая только вычисления
 * Symbol: pureCalculation (позиция: строка ~369)
 * Command: callHierarchy/outgoingCalls
 * Expected: Пустой результат (только вычисления, без вызовов функций)
 */
export function pureCalculation(a: number, b: number): number {
    const sum = a + b;
    const product = a * b;
    const difference = a - b;
    return sum + product + difference;
}

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 13 (NEGATIVE): Стрелочная функция без тела (expression body)
 * Symbol: arrowExpression (позиция: строка ~384)
 * Command: callHierarchy/outgoingCalls
 * Expected: Пустой результат (простое выражение без вызовов)
 */
export const arrowExpression = (x: number): number => x * 2;

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 14 (NEGATIVE): Функция только с возвратом значения
 * Symbol: simpleReturn (позиция: строка ~395)
 * Command: callHierarchy/outgoingCalls
 * Expected: Пустой результат (только возврат значения)
 */
export function simpleReturn(value: string): string {
    return value;
}

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 15 (NEGATIVE): Функция с локальными переменными без вызовов
 * Symbol: localVariablesOnly (позиция: строка ~408)
 * Command: callHierarchy/outgoingCalls
 * Expected: Пустой результат (только работа с локальными переменными)
 */
export function localVariablesOnly(input: string): { original: string; length: number } {
    const trimmed = input.trim();
    const upperCase = trimmed.toUpperCase();
    const length = upperCase.length;
    
    return {
        original: upperCase,
        length: length
    };
}

// ============================================================================
// ДОПОЛНИТЕЛЬНЫЕ ТЕСТОВЫЕ СЦЕНАРИИ
// ============================================================================

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 16: Функция с try-catch и вызовами
 * Symbol: safeProcessor (позиция: строка ~434)
 * Command: callHierarchy/outgoingCalls
 * Expected:
 *   - helperFunctionA() - вызов в try блоке
 *   - utilityLog() - логирование ошибки в catch
 */
export function safeProcessor(input: string): string {
    try {
        return helperFunctionA(input);
    } catch (error) {
        utilityLog(`Error: ${error}`);
        return 'Error occurred';
    }
}

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 17: Функция с тернарным оператором и вызовами
 * Symbol: ternaryCaller (позиция: строка ~454)
 * Command: callHierarchy/outgoingCalls
 * Expected:
 *   - validateInput() - проверка условия
 *   - helperFunctionA() - вызов при true
 *   - helperFunctionB() - вызов при false
 */
export function ternaryCaller(input: string): string {
    return validateInput(input) ? helperFunctionA(input) : helperFunctionB(input);
}

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 18: Геттер с вызовами
 * Symbol: ComputedClass.computedValue (позиция: строка ~469)
 * Command: callHierarchy/outgoingCalls
 * Expected:
 *   - helperFunctionC() - вызов в геттере
 */
export class ComputedClass {
    private _value: string = '';

    public get computedValue(): string {
        return helperFunctionC(this._value);
    }

    public set value(newValue: string) {
        this._value = newValue;
    }
}

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 19: Функция с деструктуризацией и вызовами
 * Symbol: destructuringCaller (позиция: строка ~490)
 * Command: callHierarchy/outgoingCalls
 * Expected:
 *   - getValues() - получение объекта для деструктуризации
 *   - helperFunctionA() - обработка первого значения
 *   - helperFunctionB() - обработка второго значения
 */
export function destructuringCaller(): string {
    const { first, second } = getValues();
    const processedFirst = helperFunctionA(first);
    const processedSecond = helperFunctionB(second);
    return `${processedFirst}-${processedSecond}`;
}

function getValues(): { first: string; second: string } {
    return { first: 'a', second: 'b' };
}

/**
 * LSP Method: callHierarchy/outgoingCalls
 * Description: Поиск исходящих вызовов (какие функции вызывает эта функция)
 * 
 * Test Case 20: Метод с колбэками
 * Symbol: CallbackUser.processWithCallback (позиция: строка ~513)
 * Command: callHierarchy/outgoingCalls
 * Expected:
 *   - helperFunctionA() - вызов внутри колбэка
 *   - helperFunctionB() - вызов внутри колбэка
 */
export class CallbackUser {
    public processWithCallback(input: string, callback: (result: string) => void): void {
        const result = helperFunctionA(input);
        callback(result);
    }

    public processWithPromise(input: string): Promise<string> {
        return new Promise((resolve) => {
            const result = helperFunctionB(input);
            resolve(result);
        });
    }
}

// ============================================================================
// ЭКСПОРТ ДЛЯ ИСПОЛЬЗОВАНИЯ В ЗАВИСИМОСТЯХ
// ============================================================================

export const workflowManager = new WorkflowManager('initial');
export const dataContainer = new DataContainer('test');
export const staticCaller = new StaticCaller();
export const computedClass = new ComputedClass();
export const callbackUser = new CallbackUser();
