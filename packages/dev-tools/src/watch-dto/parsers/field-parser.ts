import { DtoField } from '../types/index';

/**
 * 解析类体中的字段定义
 */
export function parseClassFields(classBody: string): DtoField[] {
  const fields: DtoField[] = [];
  
  // 先移除方法定义，只保留字段定义
  const cleanedBody = classBody.replace(/\w+\([^)]*\)\s*{[^}]*}/g, '');
  
  // 匹配字段定义（包括装饰器）
  const fieldRegex = /(?:@[\w().,\s'"]+\s*)*\s*(\w+)(\??):\s*([^;]+);/g;
  let match;

  while ((match = fieldRegex.exec(cleanedBody)) !== null) {
    const [fullMatch, fieldName, optional, fieldType] = match;
    
    // 提取装饰器部分
    const decoratorMatch = fullMatch.match(/@[\w().,\s'"]+/g);
    const decorators = decoratorMatch ? decoratorMatch.join(' ') : '';
    
    if (!fieldName || fieldName.trim() === '') continue;
    
    // 解析装饰器
    const decoratorList = parseDecorators(decorators);
    
    // 解析类型信息
    const { type, isArray } = parseFieldType(fieldType.trim());
    
    fields.push({
      name: fieldName.trim(),
      type,
      optional: !!optional,
      isArray,
      decorators: decoratorList,
    });
  }

  return fields;
}

/**
 * 解析字段类型，提取基础类型和数组信息
 */
function parseFieldType(typeStr: string): { type: string; isArray: boolean } {
  const trimmed = typeStr.trim();
  
  // 检查是否为数组类型
  if (trimmed.endsWith('[]')) {
    return {
      type: trimmed.slice(0, -2).trim(),
      isArray: true
    };
  }
  
  // 检查是否为 Array<T> 格式
  const arrayMatch = trimmed.match(/^Array<(.+)>$/);
  if (arrayMatch) {
    return {
      type: arrayMatch[1].trim(),
      isArray: true
    };
  }
  
  return {
    type: trimmed,
    isArray: false
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
  const classMatch = content.match(new RegExp(`export class ${sourceClass}[\\s\\S]*?\\{([\\s\\S]*?)(?=\\n\\s*export|\\n\\s*$|$)`));
  if (classMatch) {
    const classBody = classMatch[1];
    return parseClassFields(classBody);
  }
  
  return [];
}
