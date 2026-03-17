/**
 * ============================================================================
 * Файл зависимостей для тестирования callHierarchy/incomingCalls
 * Description: Функции для работы с callbacks
 * ============================================================================
 * 
 * Этот файл содержит классы и функции, которые работают с callback-функциями
 * из incomingCalls.ts для тестирования поиска входящих вызовов.
 */

import { handleCallback, callbackTarget } from '../incomingCalls';

// ============================================================================
// КЛАСС ДЛЯ ОБРАБОТКИ CALLBACK'ОВ
// ============================================================================

/**
 * Класс, который принимает и выполняет callback-функции
 * Используется для тестирования входящих вызовов callback-функций
 */
export class CallbackProcessor {
    private callback: (data: string) => void;

    constructor(callback: (data: string) => void) {
        this.callback = callback;
    }

    /**
     * Выполняет переданный callback
     * handleCallback должен отображаться во входящих вызовах
     */
    public execute(data: string): void {
        this.callback(data);
    }

    /**
     * Выполняет callback с форматированием
     */
    public executeFormatted(data: string): void {
        const formattedData = `[PROCESSED] ${data}`;
        this.callback(formattedData);
    }
}

/**
 * Класс для обработки данных с callback'ами
 */
export class DataHandler {
    private onData: (data: string) => void;
    private onError: (error: Error) => void;

    constructor(
        onData: (data: string) => void,
        onError: (error: Error) => void
    ) {
        this.onData = onData;
        this.onError = onError;
    }

    /**
     * Обрабатывает успешные данные
     */
    public handleSuccess(data: string): void {
        this.onData(data);
    }

    /**
     * Обрабатывает ошибки
     */
    public handleError(message: string): void {
        this.onError(new Error(message));
    }
}

// ============================================================================
// ФУНКЦИИ, ВЫЗЫВАЮЩИЕ CALLBACK'И
// ============================================================================

/**
 * Эта функция вызывает handleCallback напрямую
 * Должна отображаться во входящих вызовах handleCallback
 */
export function runCallback(message: string): void {
    handleCallback(message);
}

/**
 * Эта функция создаёт CallbackProcessor с handleCallback
 * handleCallback должен отображаться во входящих вызовах
 */
export function createProcessor(): CallbackProcessor {
    return new CallbackProcessor(handleCallback);
}

/**
 * Эта функция вызывает callbackTarget
 * Должна отображаться во входящих вызовах callbackTarget
 */
export function triggerCallbackTarget(msg: string): void {
    callbackTarget(msg);
}

/**
 * Эта функция использует callbackTarget в качестве callback
 * callbackTarget должен отображаться во входящих вызовах
 */
export function processWithCallback(data: string): void {
    const processor = new CallbackProcessor(callbackTarget);
    processor.execute(data);
}

// ============================================================================
// ФУНКЦИИ ДЛЯ ТЕСТИРОВАНИЯ РАЗЛИЧНЫХ СЦЕНАРИЕВ CALLBACK'ОВ
// ============================================================================

/**
 * Функция, принимающая callback и вызывающая его многократно
 */
export function repeatCallback(
    callback: (data: string) => void,
    data: string,
    times: number
): void {
    for (let i = 0; i < times; i++) {
        callback(`${data} - iteration ${i + 1}`);
    }
}

/**
 * Функция, использующая repeatCallback с handleCallback
 * handleCallback должен отображаться во входящих вызовах
 */
export function runRepeatedCallback(): void {
    repeatCallback(handleCallback, 'Test message', 3);
}

/**
 * Асинхронная функция с callback
 */
export async function asyncCallback(
    callback: (data: string) => void,
    delay: number
): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            callback('Async callback executed');
            resolve();
        }, delay);
    });
}

/**
 * Функция, использующая asyncCallback с handleCallback
 * handleCallback должен отображаться во входящих вызовах
 */
export async function runAsyncCallback(): Promise<void> {
    await asyncCallback(handleCallback, 100);
}

// ============================================================================
// ЭКСПОРТ ГОТОВЫХ ЭКЗЕМПЛЯРОВ
// ============================================================================

/**
 * Готовый экземпляр CallbackProcessor с handleCallback
 */
export const handleCallbackProcessor = new CallbackProcessor(handleCallback);

/**
 * Готовый экземпляр DataHandler с handleCallback
 */
export const dataHandler = new DataHandler(
    handleCallback,
    (error: Error) => console.error(error.message)
);
