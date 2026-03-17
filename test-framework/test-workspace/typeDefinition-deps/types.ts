/**
 * Файл с определениями типов для тестирования textDocument/typeDefinition
 */

// Пользовательский интерфейс
export interface UserType {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
}

// Интерфейс с наследованием
export interface AdminUser extends UserType {
    role: "admin";
    permissions: string[];
}

// Интерфейс для конфигурации
export interface ConfigType {
    apiUrl: string;
    timeout: number;
    retries: number;
    debug: boolean;
}

// Тип объединения (union type)
export type Status = "active" | "inactive" | "pending";

// Тип пересечения (intersection type)
export type UserWithStatus = UserType & { status: Status };

// Псевдоним для типа функции
export type HandlerFunction = (data: unknown) => void;

// Обобщённый тип
export type Response<T> = {
    success: boolean;
    data: T;
    error?: string;
};

// Утилитарный тип (Partial)
export type PartialUser = Partial<UserType>;

// Утилитарный тип (Pick)
export type UserPreview = Pick<UserType, "id" | "name">;

// Утилитарный тип (Omit)
export type UserWithoutEmail = Omit<UserType, "email">;

// Тип для readonly массива
export type ReadonlyNumbers = readonly number[];

// Тип для кортежа
export type Coordinate = [x: number, y: number, z: number];

// mapped type
export type Stringified<T> = {
    [K in keyof T]: string;
};

// conditional type
export type NonNullable<T> = T extends null | undefined ? never : T;

// Тип для callback
export type EventCallback<T = unknown> = (event: T) => void;

// Тип для конструктора
export type Constructor<T = object> = new (...args: any[]) => T;
