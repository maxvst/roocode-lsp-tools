/**
 * ============================================================================
 * Файл зависимостей для тестирования callHierarchy/incomingCalls
 * Description: Интерфейсы и классы для тестирования вызовов через интерфейсы
 * ============================================================================
 * 
 * Этот файл содержит интерфейсы и классы-потребители, которые используют
 * реализации интерфейсов из incomingCalls.ts для тестирования поиска
 * входящих вызовов через интерфейсы.
 */

import { UserServiceImpl } from '../incomingCalls';

// ============================================================================
// ИНТЕРФЕЙСЫ
// ============================================================================

/**
 * Интерфейс сервиса пользователя
 * Реализуется в incomingCalls.ts классом UserServiceImpl
 */
export interface IUserService {
    getData(): string;
    setData(data: string): void;
}

/**
 * Интерфейс для обработки данных
 */
export interface IDataProcessor {
    process(input: string): string;
    validate(input: string): boolean;
}

/**
 * Интерфейс для логирования
 */
export interface ILogger {
    log(message: string): void;
    error(message: string): void;
}

// ============================================================================
// КЛАССЫ-ПОТРЕБИТЕЛИ ИНТЕРФЕЙСОВ
// ============================================================================

/**
 * Класс, использующий IUserService через интерфейс
 * Методы UserServiceImpl должны отображаться во входящих вызовах
 */
export class InterfaceUser {
    private service: IUserService;

    constructor(service: IUserService) {
        this.service = service;
    }

    /**
     * Вызывает getData через интерфейс
     * UserServiceImpl.getData должен отображаться во входящих вызовах
     */
    public useService(): string {
        return this.service.getData();
    }

    /**
     * Вызывает setData через интерфейс
     * UserServiceImpl.setData должен отображаться во входящих вызовах
     */
    public updateService(newData: string): void {
        this.service.setData(newData);
    }

    /**
     * Комбинированный вызов методов интерфейса
     */
    public refreshService(): string {
        const currentData = this.service.getData();
        this.service.setData(`${currentData} - refreshed`);
        return this.service.getData();
    }
}

/**
 * Класс для работы с несколькими сервисами
 */
export class MultiServiceUser {
    private services: IUserService[];

    constructor(services: IUserService[]) {
        this.services = services;
    }

    /**
     * Вызывает getData для всех сервисов
     */
    public getAllData(): string[] {
        return this.services.map(service => service.getData());
    }

    /**
     * Вызывает setData для всех сервисов
     */
    public setAllData(newData: string): void {
        this.services.forEach(service => service.setData(newData));
    }
}

// ============================================================================
// ФУНКЦИИ, ВЫЗЫВАЮЩИЕ МЕТОДЫ ЧЕРЕЗ ИНТЕРФЕЙС
// ============================================================================

/**
 * Эта функция вызывает getData через интерфейс
 * UserServiceImpl.getData должен отображаться во входящих вызовах
 */
export function consumeData(service: IUserService): string {
    return service.getData();
}

/**
 * Эта функция вызывает setData через интерфейс
 * UserServiceImpl.setData должен отображаться во входящих вызовах
 */
export function updateData(service: IUserService, newData: string): void {
    service.setData(newData);
}

/**
 * Эта функция создаёт InterfaceUser с UserServiceImpl
 * и вызывает его методы
 */
export function useUserServiceImpl(): string {
    const service = new UserServiceImpl('Test Data');
    const user = new InterfaceUser(service);
    return user.useService();
}

/**
 * Эта функция использует UserServiceImpl напрямую как IUserService
 */
export function directInterfaceUsage(): void {
    const service: IUserService = new UserServiceImpl('Direct Usage');
    service.getData();
    service.setData('Updated');
}

/**
 * Эта функция использует UserServiceImpl в массиве сервисов
 */
export function multiServiceUsage(): string[] {
    const service1 = new UserServiceImpl('Service 1');
    const service2 = new UserServiceImpl('Service 2');
    const multiUser = new MultiServiceUser([service1, service2]);
    return multiUser.getAllData();
}

// ============================================================================
// ФАБРИЧНЫЕ ФУНКЦИИ
// ============================================================================

/**
 * Фабрика, создающая InterfaceUser с UserServiceImpl
 */
export function createInterfaceUser(initialData: string): InterfaceUser {
    const service = new UserServiceImpl(initialData);
    return new InterfaceUser(service);
}

/**
 * Функция, использующая фабрику и вызывающая методы
 */
export function useFactory(): string {
    const user = createInterfaceUser('Factory Data');
    return user.useService();
}

// ============================================================================
// ЭКСПОРТ ГОТОВЫХ ЭКЗЕМПЛЯРОВ
// ============================================================================

/**
 * Готовый экземпляр InterfaceUser с UserServiceImpl
 */
export const defaultInterfaceUser = new InterfaceUser(
    new UserServiceImpl('Default Data')
);

/**
 * Готовый экземпляр MultiServiceUser с несколькими UserServiceImpl
 */
export const defaultMultiServiceUser = new MultiServiceUser([
    new UserServiceImpl('Multi Service 1'),
    new UserServiceImpl('Multi Service 2')
]);
