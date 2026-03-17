/**
 * ============================================================================
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа (jump to declaration)
 * ============================================================================
 * 
 * Этот файл содержит тестовые сценарии для проверки LSP-метода 
 * textDocument/declaration. Метод возвращает местоположение объявления
 * символа под курсором.
 * 
 * Отличие от textDocument/definition:
 * - declaration указывает на место, где символ был объявлен (например, 
 *   интерфейс или абстрактный класс)
 * - definition указывает на место, где символ был определён (например,
 *   конкретная реализация)
 * 
 * ============================================================================
 */

// ============================================================================
// ИМПОРТЫ ИЗ ЗАВИСИМОСТЕЙ
// ============================================================================

import {
    exportedVariable,
    inferredVariable,
    MAX_SIZE,
    config
} from './declaration-deps/variables';

import {
    simpleFunction,
    add,
    greet,
    arrowFunction,
    asyncFunction,
    identity,
    withDefault
} from './declaration-deps/functions';

import {
    SimpleClass,
    ChildClass,
    ConfigurableClass,
    IConfigurable,
    AbstractBase,
    StaticClass,
    Container
} from './declaration-deps/classes';

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ПЕРЕМЕННЫЕ
// ============================================================================

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 1: Импортированная переменная с явным типом
 * Symbol: exportedVariable
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в ./declaration-deps/variables.ts:4
 * Notes: Переменная экспортирована и имеет явный тип string
 */
function testExportedVariable(): string {
    return exportedVariable;
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 2: Импортированная переменная с выведенным типом
 * Symbol: inferredVariable
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в ./declaration-deps/variables.ts:7
 * Notes: Тип number выведен автоматически из значения 42
 */
function testInferredVariable(): number {
    return inferredVariable;
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 3: Импортированная константа
 * Symbol: MAX_SIZE
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в ./declaration-deps/variables.ts:10
 * Notes: Константа с числовым значением 100
 */
function testMaxSize(): number {
    return MAX_SIZE;
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 4: Импортированный объект конфигурации
 * Symbol: config
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в ./declaration-deps/variables.ts:13
 * Notes: Объект с вложенными свойствами debug, version, name
 */
function testConfig(): { debug: boolean; version: string; name: string } {
    return config;
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ФУНКЦИИ
// ============================================================================

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 5: Простая функция без параметров
 * Symbol: simpleFunction
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в ./declaration-deps/functions.ts:6
 * Notes: Функция возвращает строку, не принимает параметров
 */
function testSimpleFunction(): string {
    return simpleFunction();
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 6: Функция с параметрами
 * Symbol: add
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в ./declaration-deps/functions.ts:11
 * Notes: Функция принимает два числа и возвращает их сумму
 */
function testAdd(): number {
    return add(5, 3);
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 7: Функция с необязательным параметром
 * Symbol: greet
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в ./declaration-deps/functions.ts:16
 * Notes: Второй параметр greeting является необязательным
 */
function testGreet(): string {
    return greet("World", "Hi");
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 8: Стрелочная функция
 * Symbol: arrowFunction
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в ./declaration-deps/functions.ts:21
 * Notes: Стрелочная функция, умножающая число на 2
 */
function testArrowFunction(): number {
    return arrowFunction(10);
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 9: Асинхронная функция
 * Symbol: asyncFunction
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в ./declaration-deps/functions.ts:24
 * Notes: Асинхронная функция возвращает Promise<string>
 */
async function testAsyncFunction(): Promise<string> {
    return await asyncFunction();
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 10: Обобщённая функция (generic)
 * Symbol: identity
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в ./declaration-deps/functions.ts:29
 * Notes: Функция с type parameter T, возвращает аргумент без изменений
 */
function testIdentity(): string {
    return identity<string>("test");
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 11: Функция с параметром по умолчанию
 * Symbol: withDefault
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в ./declaration-deps/functions.ts:34
 * Notes: Параметр name имеет значение по умолчанию "World"
 */
function testWithDefault(): string {
    return withDefault();
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: КЛАССЫ
// ============================================================================

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 12: Простой класс
 * Symbol: SimpleClass
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в ./declaration-deps/classes.ts:6
 * Notes: Класс с публичным свойством и методом
 */
function testSimpleClass(): SimpleClass {
    return new SimpleClass("test");
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 13: Дочерний класс (наследование)
 * Symbol: ChildClass
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в ./declaration-deps/classes.ts:17
 * Notes: Класс наследуется от SimpleClass, добавляет приватное свойство
 */
function testChildClass(): ChildClass {
    return new ChildClass("child", 5);
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 14: Класс, реализующий интерфейс
 * Symbol: ConfigurableClass
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в ./declaration-deps/classes.ts:33
 * Notes: Класс реализует интерфейс IConfigurable
 */
function testConfigurableClass(): ConfigurableClass {
    return new ConfigurableClass();
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 15: Интерфейс
 * Symbol: IConfigurable
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в ./declaration-deps/classes.ts:28
 * Notes: Интерфейс с методом configure
 */
function testIConfigurable(): IConfigurable {
    return new ConfigurableClass();
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 16: Абстрактный класс
 * Symbol: AbstractBase
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в ./declaration-deps/classes.ts:44
 * Notes: Абстрактный класс с абстрактным методом getName
 */
class ConcreteBase extends AbstractBase {
    getName(): string {
        return "Concrete";
    }
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 17: Класс со статическими членами
 * Symbol: StaticClass
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в ./declaration-deps/classes.ts:54
 * Notes: Класс со статическим свойством instanceCount
 */
function testStaticClass(): void {
    new StaticClass();
    console.log(StaticClass.instanceCount);
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 18: Обобщённый класс (generic class)
 * Symbol: Container
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в ./declaration-deps/classes.ts:66
 * Notes: Класс с type parameter T для хранения значения любого типа
 */
function testContainer(): Container<number> {
    return new Container<number>(42);
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ЛОКАЛЬНЫЕ ОБЪЯВЛЕНИЯ
// ============================================================================

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 19: Локальная переменная
 * Symbol: localVar
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в текущем файле
 * Notes: Переменная объявлена в теле функции
 */
function testLocalVariable(): number {
    const localVar = 100;
    return localVar;
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 20: Локальная функция
 * Symbol: innerFunction
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению в текущем файле
 * Notes: Функция объявлена внутри другой функции
 */
function testInnerFunction(): string {
    function innerFunction(): string {
        return "inner";
    }
    return innerFunction();
}

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ
// ============================================================================

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 21: Встроенный тип string
 * Symbol: string (в контексте типа переменной)
 * Command: textDocument/declaration
 * Expected: Провал - встроенный тип не имеет объявления в проекте
 * Notes: Примитивный тип string является встроенным в TypeScript
 */
function testBuiltInTypeString(): string {
    return "test";
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 22: Встроенный тип number
 * Symbol: number (в контексте типа переменной)
 * Command: textDocument/declaration
 * Expected: Провал - встроенный тип не имеет объявления в проекте
 * Notes: Примитивный тип number является встроенным в TypeScript
 */
function testBuiltInTypeNumber(): number {
    return 42;
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 23: Встроенный тип boolean
 * Symbol: boolean (в контексте типа переменной)
 * Command: textDocument/declaration
 * Expected: Провал - встроенный тип не имеет объявления в проекте
 * Notes: Примитивный тип boolean является встроенным в TypeScript
 */
function testBuiltInTypeBoolean(): boolean {
    return true;
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 24: Строковый литерал
 * Symbol: "literal string" (строковый литерал)
 * Command: textDocument/declaration
 * Expected: Провал - литерал не имеет объявления
 * Notes: Строковый литерал не является символом с объявлением
 */
function testStringLiteral(): string {
    const str = "literal string";
    return str;
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 25: Числовой литерал
 * Symbol: 12345 (числовой литерал)
 * Command: textDocument/declaration
 * Expected: Провал - литерал не имеет объявления
 * Notes: Числовой литерал не является символом с объявлением
 */
function testNumberLiteral(): number {
    const num = 12345;
    return num;
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 26: Объектный литерал
 * Symbol: { key: "value" } (объектный литерал)
 * Command: textDocument/declaration
 * Expected: Провал - литерал не имеет объявления
 * Notes: Объектный литерал не является символом с объявлением
 */
function testObjectLiteral(): { key: string } {
    return { key: "value" };
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 27: Массивный литерал
 * Symbol: [1, 2, 3] (массивный литерал)
 * Command: textDocument/declaration
 * Expected: Провал - литерал не имеет объявления
 * Notes: Массивный литерал не является символом с объявлением
 */
function testArrayLiteral(): number[] {
    return [1, 2, 3];
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 28: Глобальный объект console
 * Symbol: console
 * Command: textDocument/declaration
 * Expected: Провал или частичный успех - глобальный объект из lib.dom.d.ts
 * Notes: console определён в стандартной библиотеке TypeScript
 */
function testGlobalConsole(): void {
    console.log("test");
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 29: Глобальный объект Promise
 * Symbol: Promise
 * Command: textDocument/declaration
 * Expected: Провал или частичный успех - глобальный объект из lib.es2015.d.ts
 * Notes: Promise определён в стандартной библиотеке TypeScript
 */
function testGlobalPromise(): Promise<void> {
    return Promise.resolve();
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 30: Тип any
 * Symbol: any (в контексте типа)
 * Command: textDocument/declaration
 * Expected: Провал - any является встроенным типом TypeScript
 * Notes: Тип any не имеет объявления в пользовательском коде
 */
function testAnyType(): any {
    return "anything";
}

// ============================================================================
// ДОПОЛНИТЕЛЬНЫЕ ТЕСТОВЫЕ СЦЕНАРИИ
// ============================================================================

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 31: Деструктуризация объекта
 * Symbol: destructuredValue
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению переменной
 * Notes: Переменная получена через деструктуризацию объекта
 */
function testDestructuring(): string {
    const { debug: destructuredValue } = config;
    return destructuredValue ? "yes" : "no";
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 32: Псевдоним типа (type alias)
 * Symbol: MyType
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению типа в текущем файле
 * Notes: Псевдоним типа для строки
 */
type MyType = string;

function testTypeAlias(): MyType {
    return "typed value";
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 33: Enum (перечисление)
 * Symbol: Status
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению enum в текущем файле
 * Notes: Перечисление со значениями
 */
enum Status {
    Active = "ACTIVE",
    Inactive = "INACTIVE",
    Pending = "PENDING"
}

function testEnum(): Status {
    return Status.Active;
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 34: Член enum
 * Symbol: Status.Active
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению члена enum
 * Notes: Конкретное значение из перечисления
 */
function testEnumMember(): string {
    return Status.Active;
}

/**
 * LSP Method: textDocument/declaration
 * Description: Переход к объявлению символа
 * 
 * Test Case 35: Namespace с экспортом
 * Symbol: Utils.formatDate
 * Command: textDocument/declaration
 * Expected: Успех - переход к объявлению функции в namespace
 * Notes: Функция внутри namespace
 */
namespace Utils {
    export function formatDate(date: Date): string {
        return date.toISOString();
    }
    
    export const VERSION = "1.0.0";
}

function testNamespace(): string {
    return Utils.formatDate(new Date());
}

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ С НЕВАЛИДНЫМ КОДОМ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Использование неопределённой переменной
 * Symbol: undefinedVariable
 * Command: textDocument/declaration
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Переменная undefinedVariable не имеет объявления - она нигде не определена
 */
{
    // @ts-ignore
    const result = undefinedVariable;
    console.log(result);
}

/**
 * NEGATIVE TEST CASE: Вызов функции без импорта
 * Symbol: nonImportedFunction
 * Command: textDocument/declaration
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Функция nonImportedFunction не импортирована и не определена в текущем файле
 */
{
    // @ts-ignore
    nonImportedFunction();
}

/**
 * NEGATIVE TEST CASE: Опечатка в имени импорта
 * Symbol: imporrt (вместо import)
 * Command: textDocument/declaration
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Синтаксическая ошибка в операторе импорта - "imporrt" вместо "import"
 */
{
    // @ts-ignore
    // imporrt { something } from './declaration-deps/variables'; // Синтаксическая ошибка
}

/**
 * NEGATIVE TEST CASE: Импорт из несуществующего модуля
 * Symbol: x (из несуществующего модуля)
 * Command: textDocument/declaration
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Модуль './non-existent-module' не существует в файловой системе
 */
{
    // @ts-ignore
    // import { x } from './non-existent-module';
}

/**
 * NEGATIVE TEST CASE: Импорт приватной функции
 * Symbol: privateFunction
 * Command: textDocument/declaration
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Функция privateFunction в broken-exports.ts не имеет ключевого слова export
 */
{
    // @ts-ignore
    // import { privateFunction } from './declaration-deps/broken-exports';
}

/**
 * NEGATIVE TEST CASE: Обращение к несуществующему свойству объекта
 * Symbol: config.nonExistentProperty
 * Command: textDocument/declaration
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Свойство nonExistentProperty не существует в типе конфигурации
 */
{
    // @ts-ignore
    const value = config.nonExistentProperty;
    console.log(value);
}

/**
 * NEGATIVE TEST CASE: Вызов метода с опечаткой
 * Symbol: simpleFunction.wrongMethodName
 * Command: textDocument/declaration
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: simpleFunction является функцией, а не объектом с методами
 */
{
    // @ts-ignore
    simpleFunction.wrongMethodName();
}

/**
 * NEGATIVE TEST CASE: Использование типа как значения
 * Symbol: MyType (как значение)
 * Command: textDocument/declaration
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: MyType является псевдонимом типа (type alias), а не значением
 */
{
    // @ts-ignore
    const instance = new MyType();
}
