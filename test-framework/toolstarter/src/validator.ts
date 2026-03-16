/**
 * Валидатор результатов выполнения tools
 */

import type { ExpectedResult, ValidationResult } from './types';

/**
 * Валидирует результат по ожидаемым критериям
 */
export function validateResult(
  result: unknown,
  expected: ExpectedResult | undefined
): ValidationResult {
  // Если критерии не указаны - считаем валидным
  if (!expected) {
    return { valid: true };
  }

  const resultStr = stringifyResult(result);

  // Проверка contains
  if (expected.contains !== undefined) {
    if (!resultStr.includes(expected.contains)) {
      return {
        valid: false,
        error: `Result does not contain "${expected.contains}". Got: ${truncate(resultStr, 200)}`,
      };
    }
  }

  // Проверка matches (regex)
  if (expected.matches !== undefined) {
    try {
      const regex = new RegExp(expected.matches);
      if (!regex.test(resultStr)) {
        return {
          valid: false,
          error: `Result does not match pattern "${expected.matches}". Got: ${truncate(resultStr, 200)}`,
        };
      }
    } catch (e) {
      return {
        valid: false,
        error: `Invalid regex pattern "${expected.matches}": ${e instanceof Error ? e.message : String(e)}`,
      };
    }
  }

  // Проверка equals
  if (expected.equals !== undefined) {
    if (!deepEquals(result, expected.equals)) {
      return {
        valid: false,
        error: `Result does not equal expected value. Expected: ${JSON.stringify(expected.equals)}, Got: ${truncate(JSON.stringify(result), 200)}`,
      };
    }
  }

  // Проверка jsonSchema (опционально)
  if (expected.jsonSchema !== undefined) {
    const schemaResult = validateJsonSchema(result, expected.jsonSchema);
    if (!schemaResult.valid) {
      return schemaResult;
    }
  }

  return { valid: true };
}

/**
 * Преобразует результат в строку для проверки
 */
function stringifyResult(result: unknown): string {
  if (result === null) {
    return 'null';
  }
  if (result === undefined) {
    return 'undefined';
  }
  if (typeof result === 'string') {
    return result;
  }
  if (typeof result === 'number' || typeof result === 'boolean') {
    return String(result);
  }
  try {
    return JSON.stringify(result);
  } catch {
    return String(result);
  }
}

/**
 * Глубокое сравнение значений
 */
function deepEquals(a: unknown, b: unknown): boolean {
  // Простые типы
  if (a === b) {
    return true;
  }
  
  // null и undefined
  if (a == null || b == null) {
    return a === b;
  }

  // Разные типы
  if (typeof a !== typeof b) {
    return false;
  }

  // Массивы
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((item, index) => deepEquals(item, b[index]));
  }

  // Объекты
  if (typeof a === 'object' && typeof b === 'object') {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    
    const keysA = Object.keys(aObj);
    const keysB = Object.keys(bObj);
    
    if (keysA.length !== keysB.length) {
      return false;
    }
    
    return keysA.every(key => deepEquals(aObj[key], bObj[key]));
  }

  return false;
}

/**
 * Базовая валидация JSON Schema (без внешних зависимостей)
 * Поддерживает только базовые типы: type, required, properties
 */
function validateJsonSchema(
  data: unknown,
  schema: object
): ValidationResult {
  const schemaObj = schema as Record<string, unknown>;
  
  // Проверка type
  if (schemaObj.type !== undefined) {
    const expectedType = schemaObj.type as string;
    const actualType = getJsonType(data);
    
    if (expectedType !== actualType) {
      return {
        valid: false,
        error: `Type mismatch: expected "${expectedType}", got "${actualType}"`,
      };
    }
  }

  // Проверка required (для объектов)
  if (schemaObj.required !== undefined && Array.isArray(schemaObj.required)) {
    if (typeof data === 'object' && data !== null) {
      const dataObj = data as Record<string, unknown>;
      for (const field of schemaObj.required) {
        if (!(field in dataObj)) {
          return {
            valid: false,
            error: `Missing required field: "${field}"`,
          };
        }
      }
    }
  }

  // Проверка properties (для объектов)
  if (schemaObj.properties !== undefined && typeof data === 'object' && data !== null) {
    const properties = schemaObj.properties as Record<string, object>;
    const dataObj = data as Record<string, unknown>;
    
    for (const [propName, propSchema] of Object.entries(properties)) {
      if (propName in dataObj) {
        const propResult = validateJsonSchema(dataObj[propName], propSchema);
        if (!propResult.valid) {
          return {
            valid: false,
            error: `Property "${propName}": ${propResult.error}`,
          };
        }
      }
    }
  }

  // Проверка items (для массивов)
  if (schemaObj.items !== undefined && Array.isArray(data)) {
    const itemsSchema = schemaObj.items as object;
    for (let i = 0; i < data.length; i++) {
      const itemResult = validateJsonSchema(data[i], itemsSchema);
      if (!itemResult.valid) {
        return {
          valid: false,
          error: `Item [${i}]: ${itemResult.error}`,
        };
      }
    }
  }

  // Проверка minimum/maximum (для чисел)
  if (typeof data === 'number') {
    if (schemaObj.minimum !== undefined && data < (schemaObj.minimum as number)) {
      return {
        valid: false,
        error: `Value ${data} is less than minimum ${schemaObj.minimum}`,
      };
    }
    if (schemaObj.maximum !== undefined && data > (schemaObj.maximum as number)) {
      return {
        valid: false,
        error: `Value ${data} is greater than maximum ${schemaObj.maximum}`,
      };
    }
  }

  // Проверка minLength/maxLength (для строк)
  if (typeof data === 'string') {
    if (schemaObj.minLength !== undefined && data.length < (schemaObj.minLength as number)) {
      return {
        valid: false,
        error: `String length ${data.length} is less than minLength ${schemaObj.minLength}`,
      };
    }
    if (schemaObj.maxLength !== undefined && data.length > (schemaObj.maxLength as number)) {
      return {
        valid: false,
        error: `String length ${data.length} is greater than maxLength ${schemaObj.maxLength}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Определяет JSON тип значения
 */
function getJsonType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'unknown';
}

/**
 * Обрезает строку до указанной длины
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + '...';
}
