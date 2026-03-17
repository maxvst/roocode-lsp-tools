/**
 * ============================================================================
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа (jump to definition)
 * ============================================================================
 * 
 * Этот файл содержит тестовые сценарии для проверки LSP-метода 
 * textDocument/definition. Метод возвращает местоположение определения
 * символа под курсором.
 * 
 * Отличие от textDocument/declaration:
 * - definition указывает на место, где символ был определён (конкретная 
 *   реализация, тело функции, инициализация переменной)
 * - declaration указывает на место объявления (например, сигнатура в 
 *   интерфейсе)
 * 
 * ============================================================================
 */

// ============================================================================
// ИМПОРТЫ ИЗ ЗАВИСИМОСТЕЙ
// ============================================================================

import {
    definitionVariable,
    DEFINITION_CONSTANT,
    Point,
    origin,
    numbers,
    tuple
} from './definition-deps/variables';

import {
    definitionFunction,
    calculateArea,
    sum,
    createMultiplier,
    process,
    withCallback,
    exportedMethod
} from './definition-deps/functions';

import {
    IDefinitionInterface,
    IExtendedInterface,
    DefinitionClass,
    ImplementingClass,
    ParentClass,
    ChildDefinitionClass,
    AbstractDefinitionClass,
    GenericContainer,
    FactoryClass,
    DecoratedClass
} from './definition-deps/classes';

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ПЕРЕМЕННЫЕ
// ============================================================================

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 1: Импортированная переменная
 * Symbol: definitionVariable
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/variables.ts:6
 * Notes: Переменная экспортирована и инициализирована строковым значением
 */
function testDefinitionVariable(): string {
    return definitionVariable;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 2: Импортированная константа
 * Symbol: DEFINITION_CONSTANT
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/variables.ts:9
 * Notes: Константа с числовым значением 999
 */
function testDefinitionConstant(): number {
    return DEFINITION_CONSTANT;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 3: Импортированный интерфейс (как тип)
 * Symbol: Point
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/variables.ts:12
 * Notes: Интерфейс описывает точку с координатами x и y
 */
function testPointType(): Point {
    return origin;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 4: Импортированный объект
 * Symbol: origin
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/variables.ts:17
 * Notes: Объект типа Point с координатами (0, 0)
 */
function testOrigin(): Point {
    return origin;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 5: Импортированный массив
 * Symbol: numbers
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/variables.ts:20
 * Notes: Массив чисел от 1 до 5
 */
function testNumbers(): number[] {
    return numbers;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 6: Импортированный кортеж
 * Symbol: tuple
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/variables.ts:23
 * Notes: Кортеж из строки и числа
 */
function testTuple(): [string, number] {
    return tuple;
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ФУНКЦИИ
// ============================================================================

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 7: Базовая функция
 * Symbol: definitionFunction
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/functions.ts:6
 * Notes: Функция принимает строку и возвращает приветствие
 */
function testDefinitionFunction(): string {
    return definitionFunction("World");
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 8: Функция с несколькими параметрами
 * Symbol: calculateArea
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/functions.ts:11
 * Notes: Функция вычисляет площадь прямоугольника
 */
function testCalculateArea(): number {
    return calculateArea(10, 20);
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 9: Функция с rest-параметрами
 * Symbol: sum
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/functions.ts:16
 * Notes: Функция суммирует произвольное количество чисел
 */
function testSum(): number {
    return sum(1, 2, 3, 4, 5);
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 10: Функция высшего порядка
 * Symbol: createMultiplier
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/functions.ts:21
 * Notes: Функция возвращает другую функцию
 */
function testCreateMultiplier(): (n: number) => number {
    return createMultiplier(5);
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 11: Перегруженная функция
 * Symbol: process
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/functions.ts:29
 * Notes: Функция имеет несколько сигнатур (overloads)
 */
function testProcess(): void {
    const strResult = process("hello");
    const numResult = process(42);
    console.log(strResult, numResult);
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 12: Функция с callback
 * Symbol: withCallback
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/functions.ts:34
 * Notes: Функция принимает callback как параметр
 */
function testWithCallback(): void {
    withCallback("test", (result) => console.log(result));
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 13: Экспортированная стрелочная функция
 * Symbol: exportedMethod
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/functions.ts:41
 * Notes: Стрелочная функция, экспортированная через переменную
 */
function testExportedMethod(): boolean {
    return exportedMethod("test");
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ИНТЕРФЕЙСЫ
// ============================================================================

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 14: Базовый интерфейс
 * Symbol: IDefinitionInterface
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/classes.ts:6
 * Notes: Интерфейс с свойствами id, name и методом getValue
 */
function testIDefinitionInterface(): IDefinitionInterface {
    return new ImplementingClass("1", "test");
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 15: Интерфейс с наследованием
 * Symbol: IExtendedInterface
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/classes.ts:12
 * Notes: Интерфейс расширяет IDefinitionInterface
 */
function testIExtendedInterface(): IExtendedInterface {
    return {
        id: "1",
        name: "test",
        getValue: () => "value",
        timestamp: Date.now()
    };
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: КЛАССЫ
// ============================================================================

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 16: Простой класс
 * Symbol: DefinitionClass
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/classes.ts:18
 * Notes: Класс с приватным свойством, геттером/сеттером и методом
 */
function testDefinitionClass(): DefinitionClass {
    return new DefinitionClass("value", "id123");
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 17: Класс, реализующий интерфейс
 * Symbol: ImplementingClass
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/classes.ts:38
 * Notes: Класс реализует интерфейс IDefinitionInterface
 */
function testImplementingClass(): ImplementingClass {
    return new ImplementingClass("1", "test");
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 18: Родительский класс
 * Symbol: ParentClass
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/classes.ts:50
 * Notes: Базовый класс с защищённым свойством
 */
function testParentClass(): string {
    const child = new ChildDefinitionClass("John", "Doe");
    return child.getFamilyName();
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 19: Дочерний класс
 * Symbol: ChildDefinitionClass
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/classes.ts:61
 * Notes: Класс наследуется от ParentClass
 */
function testChildDefinitionClass(): string {
    const child = new ChildDefinitionClass("John", "Doe");
    return child.getFullName();
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 20: Абстрактный класс
 * Symbol: AbstractDefinitionClass
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/classes.ts:72
 * Notes: Абстрактный класс с абстрактным методом
 */
class ConcreteDefinitionClass extends AbstractDefinitionClass {
    getName(): string {
        return "Concrete";
    }
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 21: Обобщённый класс
 * Symbol: GenericContainer
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/classes.ts:82
 * Notes: Класс с type parameter T для хранения элементов
 */
function testGenericContainer(): GenericContainer<string> {
    const container = new GenericContainer<string>();
    container.add("item1");
    container.add("item2");
    return container;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 22: Класс со статическими членами (Singleton)
 * Symbol: FactoryClass
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/classes.ts:98
 * Notes: Класс реализует паттерн Singleton
 */
function testFactoryClass(): number {
    const factory = FactoryClass.getInstance();
    return factory.create();
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 23: Декорированный класс
 * Symbol: DecoratedClass
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в ./definition-deps/classes.ts:116
 * Notes: Класс с декоратором @sealed
 */
function testDecoratedClass(): DecoratedClass {
    return new DecoratedClass("decorated");
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ЧЛЕНЫ КЛАССА
// ============================================================================

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 24: Метод класса
 * Symbol: DefinitionClass.getValue
 * Command: textDocument/definition
 * Expected: Успех - переход к определению метода в ./definition-deps/classes.ts:32
 * Notes: Метод возвращает значение приватного свойства
 */
function testClassMethod(): string {
    const instance = new DefinitionClass("test", "id");
    return instance.getValue();
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 25: Геттер класса
 * Symbol: DefinitionClass.value (getter)
 * Command: textDocument/definition
 * Expected: Успех - переход к определению геттера в ./definition-deps/classes.ts:26
 * Notes: Геттер для приватного свойства _value
 */
function testClassGetter(): string {
    const instance = new DefinitionClass("test", "id");
    return instance.value;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 26: Статический метод
 * Symbol: FactoryClass.getInstance
 * Command: textDocument/definition
 * Expected: Успех - переход к определению статического метода
 * Notes: Статический метод для получения singleton-экземпляра
 */
function testStaticMethod(): FactoryClass {
    return FactoryClass.getInstance();
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ЛОКАЛЬНЫЕ ОПРЕДЕЛЕНИЯ
// ============================================================================

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 27: Локальная переменная
 * Symbol: localDefinitionVar
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в текущем файле
 * Notes: Переменная определена в теле функции
 */
function testLocalDefinition(): number {
    const localDefinitionVar = 123;
    return localDefinitionVar;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 28: Локальная функция
 * Symbol: localFunction
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в текущем файле
 * Notes: Функция определена внутри другой функции
 */
function testLocalFunction(): string {
    function localFunction(): string {
        return "local";
    }
    return localFunction();
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 29: Локальный класс
 * Symbol: LocalClass
 * Command: textDocument/definition
 * Expected: Успех - переход к определению в текущем файле
 * Notes: Класс определён внутри функции
 */
function testLocalClass(): string {
    class LocalClass {
        getValue(): string {
            return "local class";
        }
    }
    return new LocalClass().getValue();
}

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ
// ============================================================================

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 30: Примитивный тип string
 * Symbol: string (в контексте типа)
 * Command: textDocument/definition
 * Expected: Провал - примитивный тип не имеет определения в проекте
 * Notes: string является встроенным типом TypeScript
 */
function testPrimitiveString(): string {
    return "test";
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 31: Примитивный тип number
 * Symbol: number (в контексте типа)
 * Command: textDocument/definition
 * Expected: Провал - примитивный тип не имеет определения в проекте
 * Notes: number является встроенным типом TypeScript
 */
function testPrimitiveNumber(): number {
    return 42;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 32: Примитивный тип boolean
 * Symbol: boolean (в контексте типа)
 * Command: textDocument/definition
 * Expected: Провал - примитивный тип не имеет определения в проекте
 * Notes: boolean является встроенным типом TypeScript
 */
function testPrimitiveBoolean(): boolean {
    return true;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 33: Строковый литерал
 * Symbol: "literal value" (строковый литерал)
 * Command: textDocument/definition
 * Expected: Провал - литерал не имеет определения
 * Notes: Строковый литерал не является символом с определением
 */
function testStringLiteralDefinition(): string {
    const str = "literal value";
    return str;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 34: Числовой литерал
 * Symbol: 123 (числовой литерал)
 * Command: textDocument/definition
 * Expected: Провал - литерал не имеет определения
 * Notes: Числовой литерал не является символом с определением
 */
function testNumberLiteralDefinition(): number {
    const num = 123;
    return num;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 35: null
 * Symbol: null
 * Command: textDocument/definition
 * Expected: Провал - null является литералом
 * Notes: null не имеет определения в пользовательском коде
 */
function testNull(): null {
    return null;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 36: undefined
 * Symbol: undefined
 * Command: textDocument/definition
 * Expected: Провал - undefined является встроенным значением
 * Notes: undefined не имеет определения в пользовательском коде
 */
function testUndefined(): undefined {
    return undefined;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 37: Глобальный объект Math
 * Symbol: Math
 * Command: textDocument/definition
 * Expected: Провал или частичный успех - глобальный объект из lib.es5.d.ts
 * Notes: Math определён в стандартной библиотеке TypeScript
 */
function testGlobalMath(): number {
    return Math.PI;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 38: Глобальная функция setTimeout
 * Symbol: setTimeout
 * Command: textDocument/definition
 * Expected: Провал или частичный успех - глобальная функция из lib.dom.d.ts
 * Notes: setTimeout определена в стандартной библиотеке
 */
function testGlobalSetTimeout(): void {
    setTimeout(() => console.log("timeout"), 1000);
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 39: Тип void
 * Symbol: void (в контексте типа)
 * Command: textDocument/definition
 * Expected: Провал - void является встроенным типом
 * Notes: void не имеет определения в пользовательском коде
 */
function testVoidType(): void {
    // Ничего не возвращаем
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 40: Тип never
 * Symbol: never (в контексте типа)
 * Command: textDocument/definition
 * Expected: Провал - never является встроенным типом
 * Notes: never не имеет определения в пользовательском коде
 */
function testNeverType(): never {
    throw new Error("This function never returns");
}

// ============================================================================
// ДОПОЛНИТЕЛЬНЫЕ ТЕСТОВЫЕ СЦЕНАРИИ
// ============================================================================

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 41: Псевдоним типа
 * Symbol: DefinitionTypeAlias
 * Command: textDocument/definition
 * Expected: Успех - переход к определению типа в текущем файле
 * Notes: Псевдоним для типа функции
 */
type DefinitionTypeAlias = (x: number, y: number) => number;

function testDefinitionTypeAlias(): DefinitionTypeAlias {
    return (x, y) => x + y;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 42: Enum (перечисление)
 * Symbol: DefinitionStatus
 * Command: textDocument/definition
 * Expected: Успех - переход к определению enum в текущем файле
 * Notes: Перечисление со строковыми значениями
 */
enum DefinitionStatus {
    Active = "ACTIVE",
    Inactive = "INACTIVE",
    Pending = "PENDING"
}

function testDefinitionEnum(): DefinitionStatus {
    return DefinitionStatus.Active;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 43: Член enum
 * Symbol: DefinitionStatus.Active
 * Command: textDocument/definition
 * Expected: Успех - переход к определению члена enum
 * Notes: Конкретное значение из перечисления
 */
function testDefinitionEnumMember(): string {
    return DefinitionStatus.Active;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 44: Параметр функции
 * Symbol: param (параметр функции)
 * Command: textDocument/definition
 * Expected: Успех - переход к определению параметра
 * Notes: Параметр функции имеет определение в сигнатуре
 */
function testFunctionParameter(param: string): string {
    return param.toUpperCase();
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 45: Свойство объекта при деструктуризации
 * Symbol: x (из Point)
 * Command: textDocument/definition
 * Expected: Успех - переход к определению свойства в интерфейсе Point
 * Notes: Свойство получается через деструктуризацию
 */
function testDestructuredProperty(): number {
    const { x } = origin;
    return x;
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 46: Namespace
 * Symbol: DefinitionUtils
 * Command: textDocument/definition
 * Expected: Успех - переход к определению namespace
 * Notes: Namespace с экспортируемыми членами
 */
namespace DefinitionUtils {
    export function log(message: string): void {
        console.log(message);
    }
    
    export const VERSION = "2.0.0";
}

function testDefinitionNamespace(): void {
    DefinitionUtils.log("test");
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 47: Метод namespace
 * Symbol: DefinitionUtils.log
 * Command: textDocument/definition
 * Expected: Успех - переход к определению функции в namespace
 * Notes: Функция внутри namespace
 */
function testDefinitionNamespaceMethod(): void {
    DefinitionUtils.log("namespace method");
}

/**
 * LSP Method: textDocument/definition
 * Description: Переход к определению символа
 * 
 * Test Case 48: Свойство namespace
 * Symbol: DefinitionUtils.VERSION
 * Command: textDocument/definition
 * Expected: Успех - переход к определению константы в namespace
 * Notes: Константа внутри namespace
 */
function testDefinitionNamespaceProperty(): string {
    return DefinitionUtils.VERSION;
}
