/**
 * ============================================================================
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа (type definition)
 * ============================================================================
 * 
 * Этот файл содержит тестовые сценарии для проверки LSP-метода 
 * textDocument/typeDefinition. Метод возвращает местоположение определения
 * типа символа под курсором.
 * 
 * Отличие от других методов навигации:
 * - typeDefinition указывает на место, где определён ТИП символа
 * - Например, для переменной `const user: UserType = ...` переход будет
 *   к определению интерфейса UserType
 * 
 * ============================================================================
 */

// ============================================================================
// ИМПОРТЫ ИЗ ЗАВИСИМОСТЕЙ
// ============================================================================

import {
    UserType,
    AdminUser,
    ConfigType,
    Status,
    UserWithStatus,
    HandlerFunction,
    Response,
    PartialUser,
    UserPreview,
    UserWithoutEmail,
    ReadonlyNumbers,
    Coordinate,
    Stringified,
    NonNullable,
    EventCallback,
    Constructor
} from './typeDefinition-deps/types';

import {
    EntityClass,
    UserClass,
    ContainerClass,
    ResultClass,
    HandlerClass,
    StringHandlerClass,
    ISerializable,
    SerializableClass,
    EventClass,
    HttpStatusClass
} from './typeDefinition-deps/classes';

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ПЕРЕМЕННЫЕ С ЯВНЫМИ ТИПАМИ
// ============================================================================

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 1: Переменная с типом интерфейса
 * Symbol: user (переменная)
 * Type: UserType
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению UserType в ./typeDefinition-deps/types.ts:6
 * Notes: Переменная имеет явный тип UserType
 */
function testVariableWithInterfaceType(): UserType {
    const user: UserType = {
        id: 1,
        name: "John",
        email: "john@example.com",
        createdAt: new Date()
    };
    return user;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 2: Переменная с наследуемым типом интерфейса
 * Symbol: admin (переменная)
 * Type: AdminUser
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению AdminUser в ./typeDefinition-deps/types.ts:12
 * Notes: AdminUser расширяет UserType
 */
function testVariableWithInheritedType(): AdminUser {
    const admin: AdminUser = {
        id: 1,
        name: "Admin",
        email: "admin@example.com",
        createdAt: new Date(),
        role: "admin",
        permissions: ["read", "write", "delete"]
    };
    return admin;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 3: Переменная с типом конфигурации
 * Symbol: config (переменная)
 * Type: ConfigType
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению ConfigType в ./typeDefinition-deps/types.ts:19
 * Notes: Переменная с интерфейсом конфигурации
 */
function testVariableWithConfigType(): ConfigType {
    const config: ConfigType = {
        apiUrl: "https://api.example.com",
        timeout: 5000,
        retries: 3,
        debug: false
    };
    return config;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 4: Переменная с union type
 * Symbol: currentStatus (переменная)
 * Type: Status
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению Status в ./typeDefinition-deps/types.ts:26
 * Notes: Status является union type ("active" | "inactive" | "pending")
 */
function testVariableWithUnionType(): Status {
    const currentStatus: Status = "active";
    return currentStatus;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 5: Переменная с intersection type
 * Symbol: userWithStatus (переменная)
 * Type: UserWithStatus
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению UserWithStatus в ./typeDefinition-deps/types.ts:29
 * Notes: UserWithStatus является intersection type (UserType & { status: Status })
 */
function testVariableWithIntersectionType(): UserWithStatus {
    const userWithStatus: UserWithStatus = {
        id: 1,
        name: "John",
        email: "john@example.com",
        createdAt: new Date(),
        status: "active"
    };
    return userWithStatus;
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: ФУНКЦИИ С ТИПАМИ
// ============================================================================

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 6: Параметр функции с интерфейсным типом
 * Symbol: userData (параметр)
 * Type: UserType
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению UserType в ./typeDefinition-deps/types.ts:6
 * Notes: Параметр функции имеет тип UserType
 */
function testFunctionParameter(userData: UserType): string {
    return userData.name;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 7: Возвращаемый тип функции
 * Symbol: Возвращаемое значение функции
 * Type: ConfigType
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению ConfigType в ./typeDefinition-deps/types.ts:19
 * Notes: Функция возвращает ConfigType
 */
function testFunctionReturnType(): ConfigType {
    return {
        apiUrl: "https://api.example.com",
        timeout: 5000,
        retries: 3,
        debug: false
    };
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 8: Переменная с типом функции
 * Symbol: handler (переменная)
 * Type: HandlerFunction
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению HandlerFunction в ./typeDefinition-deps/types.ts:32
 * Notes: HandlerFunction является type alias для функции
 */
function testVariableWithFunctionType(): HandlerFunction {
    const handler: HandlerFunction = (data) => {
        console.log(data);
    };
    return handler;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 9: Обобщённый тип (generic type)
 * Symbol: response (переменная)
 * Type: Response<UserType>
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению Response в ./typeDefinition-deps/types.ts:36
 * Notes: Response<T> является обобщённым типом
 */
function testGenericResponseType(): Response<UserType> {
    return {
        success: true,
        data: {
            id: 1,
            name: "John",
            email: "john@example.com",
            createdAt: new Date()
        }
    };
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 10: Утилитарный тип Partial
 * Symbol: partialUser (переменная)
 * Type: PartialUser
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению PartialUser в ./typeDefinition-deps/types.ts:42
 * Notes: PartialUser = Partial<UserType>
 */
function testPartialType(): PartialUser {
    const partialUser: PartialUser = {
        name: "John"
    };
    return partialUser;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 11: Утилитарный тип Pick
 * Symbol: userPreview (переменная)
 * Type: UserPreview
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению UserPreview в ./typeDefinition-deps/types.ts:45
 * Notes: UserPreview = Pick<UserType, "id" | "name">
 */
function testPickType(): UserPreview {
    const userPreview: UserPreview = {
        id: 1,
        name: "John"
    };
    return userPreview;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 12: Утилитарный тип Omit
 * Symbol: userWithoutEmail (переменная)
 * Type: UserWithoutEmail
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению UserWithoutEmail в ./typeDefinition-deps/types.ts:48
 * Notes: UserWithoutEmail = Omit<UserType, "email">
 */
function testOmitType(): UserWithoutEmail {
    const userWithoutEmail: UserWithoutEmail = {
        id: 1,
        name: "John",
        createdAt: new Date()
    };
    return userWithoutEmail;
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: КЛАССЫ КАК ТИПЫ
// ============================================================================

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 13: Переменная с типом класса
 * Symbol: entity (переменная)
 * Type: EntityClass
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению EntityClass в ./typeDefinition-deps/classes.ts:6
 * Notes: Переменная имеет тип класса EntityClass
 */
function testClassType(): EntityClass {
    const entity: EntityClass = new EntityClass(1);
    return entity;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 14: Переменная с типом класса с конструктором
 * Symbol: user (переменная)
 * Type: UserClass
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению UserClass в ./typeDefinition-deps/classes.ts:17
 * Notes: UserClass использует parameter properties в конструкторе
 */
function testUserClassType(): UserClass {
    const user: UserClass = new UserClass(1, "John", "john@example.com");
    return user;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 15: Обобщённый класс как тип
 * Symbol: container (переменная)
 * Type: ContainerClass<string>
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению ContainerClass в ./typeDefinition-deps/classes.ts:29
 * Notes: ContainerClass<T> является обобщённым классом
 */
function testGenericClassType(): ContainerClass<string> {
    const container: ContainerClass<string> = new ContainerClass<string>("value");
    return container;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 16: Класс с несколькими type parameters
 * Symbol: result (переменная)
 * Type: ResultClass<string, Error>
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению ResultClass в ./typeDefinition-deps/classes.ts:44
 * Notes: ResultClass<T, E> имеет два type parameters
 */
function testMultiGenericClassType(): ResultClass<string, Error> {
    const result: ResultClass<string, Error> = ResultClass.success("success");
    return result;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 17: Абстрактный класс как тип
 * Symbol: handler (переменная)
 * Type: HandlerClass<string, string>
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению HandlerClass в ./typeDefinition-deps/classes.ts:72
 * Notes: HandlerClass<TInput, TOutput> является абстрактным классом
 */
function testAbstractClassType(): HandlerClass<string, string> {
    const handler: HandlerClass<string, string> = new StringHandlerClass();
    return handler;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 18: Интерфейс как тип
 * Symbol: serializable (переменная)
 * Type: ISerializable
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению ISerializable в ./typeDefinition-deps/classes.ts:87
 * Notes: ISerializable является интерфейсом
 */
function testInterfaceType(): ISerializable {
    const serializable: ISerializable = new SerializableClass({ key: "value" });
    return serializable;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 19: Класс события с обобщённым типом
 * Symbol: event (переменная)
 * Type: EventClass<string>
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению EventClass в ./typeDefinition-deps/classes.ts:100
 * Notes: EventClass<TPayload> является обобщённым классом
 */
function testEventClassType(): EventClass<string> {
    const event: EventClass<string> = new EventClass<string>();
    return event;
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: СЛОЖНЫЕ ТИПЫ
// ============================================================================

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 20: Readonly массив
 * Symbol: numbers (переменная)
 * Type: ReadonlyNumbers
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению ReadonlyNumbers в ./typeDefinition-deps/types.ts:51
 * Notes: ReadonlyNumbers = readonly number[]
 */
function testReadonlyArrayType(): ReadonlyNumbers {
    const numbers: ReadonlyNumbers = [1, 2, 3] as const;
    return numbers;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 21: Кортеж (tuple)
 * Symbol: coord (переменная)
 * Type: Coordinate
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению Coordinate в ./typeDefinition-deps/types.ts:54
 * Notes: Coordinate = [x: number, y: number, z: number]
 */
function testTupleType(): Coordinate {
    const coord: Coordinate = [1, 2, 3];
    return coord;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 22: Mapped type
 * Symbol: stringified (переменная)
 * Type: Stringified<UserType>
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению Stringified в ./typeDefinition-deps/types.ts:57
 * Notes: Stringified<T> преобразует все свойства в string
 */
function testMappedType(): Stringified<UserType> {
    const stringified: Stringified<UserType> = {
        id: "1",
        name: "John",
        email: "john@example.com",
        createdAt: "2024-01-01"
    };
    return stringified;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 23: Conditional type
 * Symbol: value (переменная)
 * Type: NonNullable<string | null>
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению NonNullable в ./typeDefinition-deps/types.ts:61
 * Notes: NonNullable<T> исключает null и undefined
 */
function testConditionalType(): NonNullable<string | null> {
    const value: NonNullable<string | null> = "test";
    return value;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 24: Тип callback с обобщением
 * Symbol: callback (переменная)
 * Type: EventCallback<UserType>
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению EventCallback в ./typeDefinition-deps/types.ts:64
 * Notes: EventCallback<T> имеет значение по умолчанию для T
 */
function testCallbackType(): EventCallback<UserType> {
    const callback: EventCallback<UserType> = (event) => {
        console.log(event.name);
    };
    return callback;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 25: Тип конструктора
 * Symbol: ctor (переменная)
 * Type: Constructor<SerializableClass>
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению Constructor в ./typeDefinition-deps/types.ts:67
 * Notes: Constructor<T> описывает конструктор класса
 */
function testConstructorType(): Constructor<SerializableClass> {
    const ctor: Constructor<SerializableClass> = SerializableClass;
    return ctor;
}

// ============================================================================
// ПОЗИТИВНЫЕ СЦЕНАРИИ: СВОЙСТВА ОБЪЕКТОВ
// ============================================================================

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 26: Свойство объекта с явным типом
 * Symbol: userId (переменная, полученная из свойства)
 * Type: number (из UserType.id)
 * Command: textDocument/typeDefinition
 * Expected: Провал - number является примитивным типом
 * Notes: Свойство id имеет примитивный тип number
 */
function testPropertyType(): number {
    const user: UserType = {
        id: 1,
        name: "John",
        email: "john@example.com",
        createdAt: new Date()
    };
    const userId: number = user.id;
    return userId;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 27: Свойство объекта с типом Date
 * Symbol: createdAt (свойство)
 * Type: Date
 * Command: textDocument/typeDefinition
 * Expected: Провал или частичный успех - Date из lib.es5.d.ts
 * Notes: Date является встроенным классом JavaScript
 */
function testDatePropertyType(): Date {
    const user: UserType = {
        id: 1,
        name: "John",
        email: "john@example.com",
        createdAt: new Date()
    };
    return user.createdAt;
}

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ: ПРИМИТИВНЫЕ ТИПЫ
// ============================================================================

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 28: Переменная с выведенным типом string
 * Symbol: inferredString (переменная)
 * Type: string (выведен)
 * Command: textDocument/typeDefinition
 * Expected: Провал - string является примитивным типом
 * Notes: Тип string выведен автоматически из строкового литерала
 */
function testInferredStringType(): string {
    const inferredString = "hello";
    return inferredString;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 29: Переменная с выведенным типом number
 * Symbol: inferredNumber (переменная)
 * Type: number (выведен)
 * Command: textDocument/typeDefinition
 * Expected: Провал - number является примитивным типом
 * Notes: Тип number выведен автоматически из числового литерала
 */
function testInferredNumberType(): number {
    const inferredNumber = 42;
    return inferredNumber;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 30: Переменная с выведенным типом boolean
 * Symbol: inferredBoolean (переменная)
 * Type: boolean (выведен)
 * Command: textDocument/typeDefinition
 * Expected: Провал - boolean является примитивным типом
 * Notes: Тип boolean выведен автоматически из литерала true
 */
function testInferredBooleanType(): boolean {
    const inferredBoolean = true;
    return inferredBoolean;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 31: Переменная с явным примитивным типом string
 * Symbol: explicitString (переменная)
 * Type: string
 * Command: textDocument/typeDefinition
 * Expected: Провал - string является примитивным типом
 * Notes: Явно указанный примитивный тип string
 */
function testExplicitStringType(): string {
    const explicitString: string = "explicit";
    return explicitString;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 32: Переменная с явным примитивным типом number
 * Symbol: explicitNumber (переменная)
 * Type: number
 * Command: textDocument/typeDefinition
 * Expected: Провал - number является примитивным типом
 * Notes: Явно указанный примитивный тип number
 */
function testExplicitNumberType(): number {
    const explicitNumber: number = 100;
    return explicitNumber;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 33: Переменная с явным примитивным типом boolean
 * Symbol: explicitBoolean (переменная)
 * Type: boolean
 * Command: textDocument/typeDefinition
 * Expected: Провал - boolean является примитивным типом
 * Notes: Явно указанный примитивный тип boolean
 */
function testExplicitBooleanType(): boolean {
    const explicitBoolean: boolean = false;
    return explicitBoolean;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 34: Переменная с типом null
 * Symbol: nullValue (переменная)
 * Type: null
 * Command: textDocument/typeDefinition
 * Expected: Провал - null является литералом типа
 * Notes: null не имеет определения типа в пользовательском коде
 */
function testNullType(): null {
    const nullValue: null = null;
    return nullValue;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 35: Переменная с типом undefined
 * Symbol: undefinedValue (переменная)
 * Type: undefined
 * Command: textDocument/typeDefinition
 * Expected: Провал - undefined является литералом типа
 * Notes: undefined не имеет определения типа в пользовательском коде
 */
function testUndefinedType(): undefined {
    const undefinedValue: undefined = undefined;
    return undefinedValue;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 36: Переменная с типом void
 * Symbol: voidResult (переменная)
 * Type: void
 * Command: textDocument/typeDefinition
 * Expected: Провал - void является встроенным типом
 * Notes: void используется для функций без возвращаемого значения
 */
function testVoidType(): void {
    const voidResult: void = undefined;
    console.log(voidResult);
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 37: Переменная с типом any
 * Symbol: anyValue (переменная)
 * Type: any
 * Command: textDocument/typeDefinition
 * Expected: Провал - any является встроенным типом
 * Notes: any отключает проверку типов
 */
function testAnyType(): any {
    const anyValue: any = "anything";
    return anyValue;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 38: Переменная с типом unknown
 * Symbol: unknownValue (переменная)
 * Type: unknown
 * Command: textDocument/typeDefinition
 * Expected: Провал - unknown является встроенным типом
 * Notes: unknown является type-safe аналогом any
 */
function testUnknownType(): unknown {
    const unknownValue: unknown = "unknown";
    return unknownValue;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 39: Переменная с типом never
 * Symbol: neverValue (переменная)
 * Type: never
 * Command: textDocument/typeDefinition
 * Expected: Провал - never является встроенным типом
 * Notes: never представляет тип, который никогда не возникает
 */
function testNeverType(): never {
    throw new Error("This function never returns");
}

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ: ВСТРОЕННЫЕ ТИПЫ
// ============================================================================

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 40: Встроенный тип Array
 * Symbol: array (переменная)
 * Type: Array<string> или string[]
 * Command: textDocument/typeDefinition
 * Expected: Провал или частичный успех - Array из lib.es5.d.ts
 * Notes: Array является встроенным типом JavaScript
 */
function testBuiltInArrayType(): string[] {
    const array: string[] = ["a", "b", "c"];
    return array;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 41: Встроенный тип Object
 * Symbol: obj (переменная)
 * Type: Object
 * Command: textDocument/typeDefinition
 * Expected: Провал или частичный успех - Object из lib.es5.d.ts
 * Notes: Object является базовым типом JavaScript
 */
function testBuiltInObjectType(): object {
    const obj: object = { key: "value" };
    return obj;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 42: Встроенный тип Promise
 * Symbol: promise (переменная)
 * Type: Promise<string>
 * Command: textDocument/typeDefinition
 * Expected: Провал или частичный успех - Promise из lib.es2015.d.ts
 * Notes: Promise является встроенным типом JavaScript
 */
function testBuiltInPromiseType(): Promise<string> {
    const promise: Promise<string> = Promise.resolve("result");
    return promise;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 43: Встроенный тип Map
 * Symbol: map (переменная)
 * Type: Map<string, number>
 * Command: textDocument/typeDefinition
 * Expected: Провал или частичный успех - Map из lib.es2015.d.ts
 * Notes: Map является встроенным типом JavaScript
 */
function testBuiltInMapType(): Map<string, number> {
    const map: Map<string, number> = new Map();
    map.set("key", 1);
    return map;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 44: Встроенный тип Set
 * Symbol: set (переменная)
 * Type: Set<string>
 * Command: textDocument/typeDefinition
 * Expected: Провал или частичный успех - Set из lib.es2015.d.ts
 * Notes: Set является встроенным типом JavaScript
 */
function testBuiltInSetType(): Set<string> {
    const set: Set<string> = new Set(["a", "b", "c"]);
    return set;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 45: Встроенный тип Function
 * Symbol: func (переменная)
 * Type: Function
 * Command: textDocument/typeDefinition
 * Expected: Провал или частичный успех - Function из lib.es5.d.ts
 * Notes: Function является встроенным типом JavaScript
 */
function testBuiltInFunctionType(): Function {
    const func: Function = () => "result";
    return func;
}

// ============================================================================
// ДОПОЛНИТЕЛЬНЫЕ ТЕСТОВЫЕ СЦЕНАРИИ
// ============================================================================

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 46: Локальный псевдоним типа
 * Symbol: LocalType (локальный type alias)
 * Type: LocalType
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению типа в текущем файле
 * Notes: Псевдоним типа определён локально
 */
type LocalType = {
    value: string;
    count: number;
};

function testLocalTypeAlias(): LocalType {
    const data: LocalType = {
        value: "test",
        count: 1
    };
    return data;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 47: Локальный интерфейс
 * Symbol: ILocalInterface (локальный интерфейс)
 * Type: ILocalInterface
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению интерфейса в текущем файле
 * Notes: Интерфейс определён локально
 */
interface ILocalInterface {
    name: string;
    value: number;
}

function testLocalInterface(): ILocalInterface {
    const data: ILocalInterface = {
        name: "test",
        value: 42
    };
    return data;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 48: Локальный enum
 * Symbol: LocalEnum (локальный enum)
 * Type: LocalEnum
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению enum в текущем файле
 * Notes: Enum определён локально
 */
enum LocalEnum {
    First = "FIRST",
    Second = "SECOND",
    Third = "THIRD"
}

function testLocalEnum(): LocalEnum {
    const value: LocalEnum = LocalEnum.First;
    return value;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 49: Локальный класс
 * Symbol: LocalClass (локальный класс)
 * Type: LocalClass
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению класса в текущем файле
 * Notes: Класс определён локально
 */
class LocalClass {
    constructor(public value: string) {}
    
    getValue(): string {
        return this.value;
    }
}

function testLocalClass(): LocalClass {
    const instance: LocalClass = new LocalClass("test");
    return instance;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 50: Деструктуризация с типом
 * Symbol: id, name (деструктурированные переменные)
 * Type: number (из UserType.id), string (из UserType.name)
 * Command: textDocument/typeDefinition
 * Expected: Провал - примитивные типы
 * Notes: При деструктуризации типы берутся из свойств интерфейса
 */
function testDestructuringWithType(): { id: number; name: string } {
    const user: UserType = {
        id: 1,
        name: "John",
        email: "john@example.com",
        createdAt: new Date()
    };
    const { id, name } = user;
    return { id, name };
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 51: Статическое свойство класса как тип
 * Symbol: HttpStatusClass.OK
 * Type: HttpStatusClass
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению HttpStatusClass
 * Notes: Статические свойства класса имеют тип класса
 */
function testStaticPropertyType(): HttpStatusClass {
    const status: HttpStatusClass = HttpStatusClass.OK;
    return status;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 52: Тип параметра конструктора
 * Symbol: data (параметр конструктора)
 * Type: Record<string, unknown>
 * Command: textDocument/typeDefinition
 * Expected: Провал или частичный успех - Record из lib.es5.d.ts
 * Notes: Record является утилитарным типом TypeScript
 */
function testConstructorParameterType(): SerializableClass {
    const data: Record<string, unknown> = { key: "value" };
    return new SerializableClass(data);
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 53: Тип в generic ограничении
 * Symbol: T (в generic ограничении)
 * Type: extends UserType
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению UserType
 * Notes: Generic параметр ограничен типом UserType
 */
function processUser<T extends UserType>(user: T): T {
    return user;
}

function testGenericConstraint(): UserType {
    const user: UserType = {
        id: 1,
        name: "John",
        email: "john@example.com",
        createdAt: new Date()
    };
    return processUser(user);
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 54: Тип элемента массива
 * Symbol: firstUser (элемент массива)
 * Type: UserType
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению UserType
 * Notes: Тип элемента массива UserType[]
 */
function testArrayElementType(): UserType | undefined {
    const users: UserType[] = [
        { id: 1, name: "John", email: "john@example.com", createdAt: new Date() }
    ];
    const firstUser: UserType | undefined = users[0];
    return firstUser;
}

/**
 * LSP Method: textDocument/typeDefinition
 * Description: Переход к определению типа символа
 * 
 * Test Case 55: Тип значения в Record
 * Symbol: handlers (значение в Record)
 * Type: EventCallback
 * Command: textDocument/typeDefinition
 * Expected: Успех - переход к определению EventCallback
 * Notes: Record<string, EventCallback> использует импортированный тип
 */
function testRecordValueType(): Record<string, EventCallback<UserType>> {
    const handlers: Record<string, EventCallback<UserType>> = {
        onCreate: (user) => console.log(user.name),
        onUpdate: (user) => console.log(user.email)
    };
    return handlers;
}

// ============================================================================
// НЕГАТИВНЫЕ СЦЕНАРИИ С НЕВАЛИДНЫМ КОДОМ
// ============================================================================

/**
 * NEGATIVE TEST CASE: Переменная с неопределённым типом
 * Symbol: undefinedTypeVariable
 * Command: textDocument/typeDefinition
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Переменная не имеет объявления типа и не может быть выведена
 */
{
    // @ts-ignore
    const undefinedTypeVariable = nonExistentValue;
    console.log(undefinedTypeVariable);
}

/**
 * NEGATIVE TEST CASE: Generic без указания type parameter
 * Symbol: ContainerClass (без <T>)
 * Command: textDocument/typeDefinition
 * Expected: ЧАСТИЧНЫЙ УСПЕХ - переход к ContainerClass, но тип не определён
 * Reason: Generic тип используется без указания type parameter
 */
{
    // @ts-ignore
    const container: ContainerClass = new ContainerClass();
    console.log(container);
}

/**
 * NEGATIVE TEST CASE: Type assertion на несуществующий тип
 * Symbol: NonExistentType (в type assertion)
 * Command: textDocument/typeDefinition
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Тип NonExistentType не определён в проекте
 */
{
    // @ts-ignore
    const value = "test" as NonExistentType;
    console.log(value);
}

/**
 * NEGATIVE TEST CASE: Импорт типа из сломанного файла
 * Symbol: BrokenType (из broken-types.ts)
 * Command: textDocument/typeDefinition
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Файл broken-types.ts содержит некорректные определения типов
 */
{
    // @ts-ignore
    // import { BrokenType } from './typeDefinition-deps/broken-types';
    // const broken: BrokenType = {};
}

/**
 * NEGATIVE TEST CASE: Циклическая ссылка в типе
 * Symbol: CircularType
 * Command: textDocument/typeDefinition
 * Expected: ОГРАНИЧЕННЫЙ УСПЕХ - может привести к бесконечному циклу
 * Reason: Тип содержит циклическую ссылку на самого себя
 */
{
    interface CircularType {
        self: CircularType;
    }
    const circular: CircularType = {} as CircularType;
    circular.self = circular;
    console.log(circular);
}

/**
 * NEGATIVE TEST CASE: Использование значения как типа
 * Symbol: valueAsType (используется как тип)
 * Command: textDocument/typeDefinition
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Значение 'stringValue' используется там, где ожидается тип
 */
{
    const stringValue = "hello";
    // @ts-ignore
    const wrongUsage: stringValue = "test";
    console.log(wrongUsage);
}

/**
 * NEGATIVE TEST CASE: Обращение к типу через точку у примитива
 * Symbol: string.nonExistentMethod
 * Command: textDocument/typeDefinition
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Метод nonExistentMethod не существует у типа string
 */
{
    const str = "test";
    // @ts-ignore
    const result = str.nonExistentMethod();
    console.log(result);
}

/**
 * NEGATIVE TEST CASE: Generic с неверным типом параметра
 * Symbol: Response<NonExistentType>
 * Command: textDocument/typeDefinition
 * Expected: ЧАСТИЧНЫЙ УСПЕХ для Response, ОШИБКА для NonExistentType
 * Reason: Generic параметр NonExistentType не существует
 */
{
    // @ts-ignore
    const response: Response<NonExistentType> = {
        success: true,
        data: {}
    };
    console.log(response);
}

/**
 * NEGATIVE TEST CASE: Type assertion на null
 * Symbol: null as UserType
 * Command: textDocument/typeDefinition
 * Expected: УСПЕХ для UserType, но ОШИБКА времени выполнения
 * Reason: null приводится к типу UserType - это некорректное использование
 */
{
    // @ts-ignore
    const nullUser: UserType = null as UserType;
    console.log(nullUser);
}

/**
 * NEGATIVE TEST CASE: Использование typeof на несуществующей переменной
 * Symbol: typeof nonExistentVariable
 * Command: textDocument/typeDefinition
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Переменная nonExistentVariable не существует
 */
{
    // @ts-ignore
    type InferredType = typeof nonExistentVariable;
    const inferred: InferredType = undefined;
    console.log(inferred);
}

/**
 * NEGATIVE TEST CASE: keyof на несуществующем типе
 * Symbol: keyof NonExistentInterface
 * Command: textDocument/typeDefinition
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Интерфейс NonExistentInterface не существует
 */
{
    // @ts-ignore
    type Keys = keyof NonExistentInterface;
    const key: Keys = "any";
    console.log(key);
}

/**
 * NEGATIVE TEST CASE: Indexed access type с неверным ключом
 * Symbol: UserType['nonExistentProperty']
 * Command: textDocument/typeDefinition
 * Expected: ПУСТОЙ РЕЗУЛЬТАТ или ОШИБКА
 * Reason: Свойство nonExistentProperty не существует в UserType
 */
{
    // @ts-ignore
    type WrongProperty = UserType['nonExistentProperty'];
    const prop: WrongProperty = undefined;
    console.log(prop);
}
