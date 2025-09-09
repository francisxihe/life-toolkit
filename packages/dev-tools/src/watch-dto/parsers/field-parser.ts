import { DtoField } from "../types";
import { dtoAstParser } from "./ast-field-parser";

/**
 * 解析类的字段定义 - 使用 AST 解析器
 */
export function parseClassFields(classBody: string, className?: string): DtoField[] {
  try {
    // 如果传入的是完整的类定义，直接使用
    if (classBody.includes('export class')) {
      return dtoAstParser.parseClassFields(classBody, className);
    } else {
      // 构造完整的类定义用于 AST 解析
      const fullClassContent = className 
        ? `export class ${className} {\n${classBody}\n}`
        : `export class TempClass {\n${classBody}\n}`;
      
      return dtoAstParser.parseClassFields(fullClassContent, className || 'TempClass');
    }
  } catch (error) {
    console.warn("AST解析字段失败，回退到正则表达式:", error);
    return parseClassFieldsRegex(classBody);
  }
}

/**
 * 回退的正则表达式解析方法
 */
function parseClassFieldsRegex(classBody: string): DtoField[] {
  const fields: DtoField[] = [];

  // Remove decorators and comments
  let cleanedBody = classBody
    .replace(/\/\*\*[\s\S]*?\*\//g, '') // Remove JSDoc
    .replace(/\/\/.*$/gm, '') // Remove line comments
    .replace(/@[^(\n]*(?:\([^)]*\))?\s*/g, '') // Remove decorators
    .replace(/\w+\([^)]*\)\s*{[^}]*}/g, ''); // Remove methods

  // Regex to match field definitions
  const fieldRegex = /^\s*(\w+)([?!]?):\s*([^;=\n]+)(?:[;=]|$)/gm;
  let match;

  while ((match = fieldRegex.exec(cleanedBody)) !== null) {
    const [, fieldName, modifier, fieldType] = match;

    if (!fieldName || fieldName.length < 2) continue;

    const { type, isArray } = parseFieldType(fieldType.trim());

    // Skip decorator config keys
    if (['type', 'length', 'nullable', 'default', 'enum'].includes(fieldName)) continue;

    fields.push({
      name: fieldName.trim(),
      type,
      optional: modifier === '?',
      isArray,
      decorators: [],
    });
  }

  return fields;
}

/**
 * 解析字段类型，处理数组和复杂类型
 */
function parseFieldType(typeStr: string): { type: string; isArray: boolean } {
  const cleanType = typeStr.trim();
  
  // 检查是否为数组类型
  if (cleanType.endsWith('[]')) {
    return {
      type: cleanType.slice(0, -2).trim(),
      isArray: true,
    };
  }

  // 检查是否为 Array<T> 格式
  const arrayMatch = cleanType.match(/^Array<(.+)>$/);
  if (arrayMatch) {
    return {
      type: arrayMatch[1].trim(),
      isArray: true,
    };
  }

  return {
    type: cleanType,
    isArray: false,
  };
}

/**
 * 解析装饰器列表
 */
function parseDecorators(decoratorStr: string): string[] {
  if (!decoratorStr || decoratorStr.trim() === '') {
    return [];
  }

  const decorators: string[] = [];
  const decoratorRegex = /@(\w+)(?:\([^)]*\))?/g;
  let match;

  while ((match = decoratorRegex.exec(decoratorStr)) !== null) {
    decorators.push(match[0]);
  }

  return decorators;
}

/**
 * 从源类中获取字段定义 - 简化版本，不做跨文件查找
 */
export function getFieldsFromSource(sourceClass: string, content: string): DtoField[] {
  // 只从当前文件中查找类定义
  const classMatch = content.match(
    new RegExp(`export class ${sourceClass}[\\s\\S]*?\\{([\\s\\S]*?)(?=\\n\\s*export|\\n\\s*$|$)`)
  );
  if (classMatch) {
    const classBody = classMatch[1];
    return parseClassFields(classBody);
  }

  return [];
}
