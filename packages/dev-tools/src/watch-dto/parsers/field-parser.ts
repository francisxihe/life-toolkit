import { DtoField } from '../types/index';

/**
 * 解析类体中的字段定义
 */
export function parseClassFields(classBody: string): DtoField[] {
  const fields: DtoField[] = [];

  // 移除方法定义和复杂的代码块
  let cleanedBody = classBody
    .replace(/\w+\([^)]*\)\s*{[^}]*}/g, '') // 移除方法
    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除块注释
    .replace(/\/\/.*$/gm, ''); // 移除行注释

  // 使用更精确的正则匹配字段定义
  // 匹配：可选装饰器 + 字段名 + 可选问号 + 冒号 + 类型 + 分号
  const lines = cleanedBody.split('\n');
  let currentField: Partial<DtoField> | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 跳过空行和注释
    if (!line || line.startsWith('//') || line.startsWith('/*')) continue;
    
    // 检查是否是装饰器行
    if (line.startsWith('@')) {
      // 如果已有字段在处理，先保存装饰器信息
      if (!currentField) {
        currentField = { decorators: [] };
      }
      currentField.decorators = currentField.decorators || [];
      currentField.decorators.push(line);
      continue;
    }
    
    // 匹配字段定义：fieldName?: Type;
    const fieldMatch = line.match(/^\s*(\w+)(\??):\s*([^;]+);?\s*$/);
    if (fieldMatch) {
      const [, fieldName, optional, fieldType] = fieldMatch;
      
      // 解析类型信息
      const { type, isArray } = parseFieldType(fieldType.trim());
      
      fields.push({
        name: fieldName.trim(),
        type,
        optional: optional === '?',
        isArray,
        decorators: currentField?.decorators || [],
      });
      
      // 重置当前字段
      currentField = null;
    } else {
      // 检查是否是多行对象类型的开始
      const multiLineFieldMatch = line.match(/^\s*(\w+)(\??):\s*\{\s*$/);
      if (multiLineFieldMatch) {
        const [, fieldName, optional] = multiLineFieldMatch;
        
        // 收集多行对象类型定义
        let objectType = '{';
        let braceCount = 1;
        let j = i + 1;
        
        while (j < lines.length && braceCount > 0) {
          const nextLine = lines[j].trim();
          objectType += ' ' + nextLine;
          
          // 计算大括号数量
          for (const char of nextLine) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
          }
          
          j++;
        }
        
        // 检查是否有数组标记
        if (j < lines.length && lines[j].trim() === '[];') {
          objectType += '[]';
          j++;
        }
        
        // 解析类型信息
        const { type, isArray } = parseFieldType(objectType);
        
        fields.push({
          name: fieldName.trim(),
          type,
          optional: optional === '?',
          isArray,
          decorators: currentField?.decorators || [],
        });
        
        // 跳过已处理的行
        i = j - 1;
        currentField = null;
      }
    }
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
      isArray: true,
    };
  }

  // 检查是否为 Array<T> 格式
  const arrayMatch = trimmed.match(/^Array<(.+)>$/);
  if (arrayMatch) {
    return {
      type: arrayMatch[1].trim(),
      isArray: true,
    };
  }

  return {
    type: trimmed,
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
