/**
 * ============================================================================
 * BROKEN USAGE FOR NEGATIVE TEST CASES
 * LSP Method: textDocument/references
 * ============================================================================
 * 
 * Этот файл содержит намеренно сломанный код для тестирования
 * отказоустойчивости LSP при поиске ссылок в невалидном коде.
 * 
 * ВНИМАНИЕ: Этот файл содержит код с намеренными ошибками!
 * Не используйте эти паттерны в production коде.
 */

// ============================================================================
// ИСПОЛЬЗОВАНИЕ СИМВОЛА С ОПЕЧАТКОЙ В ИМЕНИ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Использование символа с опечаткой
 * Symbol: incorrectlyImportedSymbol (правильное: incorrectlyImportedSymbol)
 * Description: Попытка использовать символ с опечаткой в имени
 * Reason: Опечатка приводит к тому, что LSP не найдёт связь с оригинальным символом
 */
// @ts-expect-error - опечатка в имени импортируемого символа
import { incorrectlyImportedSymbl } from '../references'; // должно быть incorrectlyImportedSymbol

/**
 * NEGATIVE TEST CASE: Использование опечатки
 */
function useTypoSymbol(): string {
    // @ts-expect-error - символ не существует из-за опечатки
    return incorrectlyImportedSymbl;
}

// ============================================================================
// ИМПОРТ ИЗ НЕСУЩЕСТВУЮЩЕГО МОДУЛЯ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Импорт из несуществующего модуля
 * Symbol: nonExistentModule
 * Description: Попытка импорта из модуля, который не существует
 * Reason: LSP не сможет разрешить импорт и найти ссылки
 */
// @ts-expect-error - модуль не существует
import { someExport } from './non-existent-module';

/**
 * NEGATIVE TEST CASE: Использование несуществующего импорта
 */
function useNonExistentImport(): void {
    // @ts-expect-error - символ не существует
    console.log(someExport);
}

// ============================================================================
// ИСПОЛЬЗОВАНИЕ СИМВОЛА С НЕПРАВИЛЬНОЙ СИГНАТУРОЙ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Использование функции с неправильной сигнатурой
 * Symbol: strictFunction (из references.ts)
 * Description: Вызов функции с аргументами неправильного типа
 * Reason: Несоответствие типов делает код невалидным
 */
import { strictFunction } from '../references';

/**
 * NEGATIVE TEST CASE: Неправильное использование strictFunction
 */
function misuseStrictFunction(): number {
    // @ts-expect-error - передача number вместо string
    return strictFunction(12345); // должно быть string
    
    // Правильное использование:
    // return strictFunction('12345');
}

/**
 * NEGATIVE TEST CASE: Неправильное количество аргументов
 */
function wrongArity(): void {
    // @ts-expect-error - слишком много аргументов
    strictFunction('hello', 'extra', 'args');
    
    // @ts-expect-error - слишком мало аргументов
    strictFunction();
}

// ============================================================================
// ЦИКЛИЧЕСКИЙ ИМПОРТ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Циклический импорт
 * Symbol: circularReferenceSymbol (из references.ts)
 * Description: Этот файл импортируется в references.ts, который импортирует этот файл
 * Reason: Циклические зависимости могут вызвать проблемы при анализе LSP
 */
import { circularReferenceSymbol } from '../references';

/**
 * NEGATIVE TEST CASE: Символ для обратного циклического импорта
 * Symbol: circularReferenceBack
 * Description: Экспортируется для создания циклической зависимости
 */
export const circularReferenceBack = 'creates circular dependency with references.ts';

/**
 * NEGATIVE TEST CASE: Использование циклически импортированного символа
 */
function useCircularSymbol(): string {
    return circularReferenceSymbol;
}

// ============================================================================
// СИНТАКСИЧЕСКИЕ ОШИБКИ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Символ в файле с синтаксическими ошибками
 * Symbol: symbolInBrokenFile
 * Description: Символ объявлен в файле с синтаксическими ошибками
 * Reason: Синтаксические ошибки могут помешать LSP распарсить файл
 */
export const symbolInBrokenFile = 'this file has syntax errors';

// Синтаксическая ошибка (закомментирована, чтобы файл мог быть импортирован)
// Раскомментируйте для тестирования реальных синтаксических ошибок:
// function broken( { // незакрытая скобка

/**
 * NEGATIVE TEST CASE: "Сломанный" экспорт
 * Symbol: brokenImportedSymbol
 * Description: Символ, который "сломан" из-за проблем в файле
 */
export const brokenImportedSymbol = 'this symbol is in a broken file';

// ============================================================================
// ИСПОЛЬЗОВАНИЕ НЕСУЩЕСТВУЮЩИХ ЭКСПОРТОВ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Импорт несуществующего экспорта
 * Symbol: nonExistentExport
 * Description: Попытка импорта символа, который не экспортируется
 * Reason: Символ существует в файле, но не экспортирован
 */
// @ts-expect-error - символ не экспортируется
import { privateService } from '../references';

/**
 * NEGATIVE TEST CASE: Использование несуществующего экспорта
 */
function useNonExported(): void {
    // @ts-expect-error - символ не доступен
    console.log(privateService);
}

// ============================================================================
// НЕПРАВИЛЬНОЕ ИСПОЛЬЗОВАНИЕ ТИПОВ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Использование типа как значения
 * Symbol: Serializable (из references.ts)
 * Description: Попытка использовать тип как значение
 * Reason: Типы существуют только во время компиляции
 */
import type { Serializable } from '../references';

/**
 * NEGATIVE TEST CASE: Использование типа как значения
 */
function useTypeAsValue(): void {
    // @ts-expect-error - тип нельзя использовать как значение
    const instance = new Serializable();
}

// ============================================================================
// ДЕСТРУКТУРИЗАЦИЯ С ОШИБКАМИ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Деструктуризация с несуществующими свойствами
 * Symbol: configObject (из references.ts)
 * Description: Попытка деструктурировать несуществующие свойства
 * Reason: Свойства не существуют в объекте
 */
import { configObject } from '../references';

/**
 * NEGATIVE TEST CASE: Деструктуризация несуществующих свойств
 */
function destructureNonExistent(): void {
    // @ts-expect-error - свойство nonExistentProperty не существует
    const { nonExistentProperty } = configObject;
    
    // @ts-expect-error - свойство anotherMissingProperty не существует
    const { anotherMissingProperty } = configObject;
}

// ============================================================================
// ИСПОЛЬЗОВАНИЕ УСТАРЕВШИХ/УДАЛЁННЫХ СИМВОЛОВ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Использование удалённого символа
 * Symbol: removedSymbol
 * Description: Символ был удалён из исходного файла
 * Reason: Символ больше не существует, но код пытается его использовать
 */
// @ts-expect-error - символ был удалён
import { removedSymbol } from '../references';

/**
 * NEGATIVE TEST CASE: Использование устаревшего символа
 * @deprecated Этот символ устарел
 */
export const deprecatedSymbol = 'this symbol is deprecated';

/**
 * NEGATIVE TEST CASE: Использование deprecated символа
 */
function useDeprecated(): string {
    // @ts-deprecated - использование устаревшего символа
    return deprecatedSymbol;
}

// ============================================================================
// ПРОБЛЕМЫ С THIS
// ============================================================================

/**
 * NEGATIVE TEST CASE: Неправильное использование this
 * Symbol: this
 * Description: Использование this вне контекста класса
 * Reason: this не определён в стрелочных функциях на верхнем уровне
 */
const brokenThisUsage = {
    value: 'test',
    method: () => {
        // @ts-expect-error - this не определён в стрелочной функции
        return this.value;
    }
};

// ============================================================================
// ЭКСПОРТ ДЛЯ ТЕСТИРОВАНИЯ
// ============================================================================

export {
    brokenImportedSymbol as brokenExport,
    deprecatedSymbol as legacySymbol,
};
