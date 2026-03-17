/**
 * ============================================================================
 * Файл с намеренно сломанными экспортами для негативных тестов
 * ============================================================================
 * 
 * Этот файл содержит функции и переменные БЕЗ ключевого слова export.
 * Используется для проверки поведения LSP при попытке импорта приватных членов.
 */

/**
 * Приватная функция без экспорта
 * Symbol: privateFunction
 * Command: textDocument/declaration (из другого файла)
 * Expected: ОШИБКА - функция не экспортирована
 */
function privateFunction(): string {
    return "This is a private function without export";
}

/**
 * Приватная переменная без экспорта
 * Symbol: privateVariable
 * Command: textDocument/declaration (из другого файла)
 * Expected: ОШИБКА - переменная не экспортирована
 */
const privateVariable: number = 42;

/**
 * Приватный класс без экспорта
 * Symbol: PrivateClass
 * Command: textDocument/declaration (из другого файла)
 * Expected: ОШИБКА - класс не экспортирован
 */
class PrivateClass {
    constructor(private value: string) {}
    
    getValue(): string {
        return this.value;
    }
}

/**
 * Приватный интерфейс без экспорта
 * Symbol: IPrivateInterface
 * Command: textDocument/declaration (из другого файла)
 * Expected: ОШИБКА - интерфейс не экспортирован
 */
interface IPrivateInterface {
    name: string;
    value: number;
}

/**
 * Приватное перечисление без экспорта
 * Symbol: PrivateEnum
 * Command: textDocument/declaration (из другого файла)
 * Expected: ОШИБКА - enum не экспортирован
 */
enum PrivateEnum {
    First = "FIRST",
    Second = "SECOND",
    Third = "THIRD"
}

// Примечание: Ни один из членов этого файла не может быть импортирован
// из других файлов, так как все они не имеют ключевого слова 'export'
