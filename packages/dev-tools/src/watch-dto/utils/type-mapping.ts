import { DtoField } from '../types';

/**
 * TypeScript 类型到 VO 类型的映射
 */
export function mapTsTypeToVoType(tsType: string): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    Date: 'string',
    any: 'any',
    unknown: 'unknown',
    void: 'void',
    null: 'null',
    undefined: 'undefined',
  };

  return typeMap[tsType] || tsType;
}

/**
 * 将 DTO 类型转换为 VO 类型
 */
export function convertDtoTypeToVoType(dtoType: string): string {
  // 处理数组类型
  const isArray = dtoType.endsWith('[]');
  const baseType = isArray ? dtoType.slice(0, -2) : dtoType;

  let voType: string;

  // Entity 类型转换为 VO 类型
  if (['Task', 'Todo', 'Goal', 'Habit', 'TrackTime', 'User'].includes(baseType)) {
    voType = `${baseType}Vo`;
  } else if (baseType.endsWith('Dto')) {
    // DTO 类型转换为 VO 类型
    voType = baseType.replace('Dto', 'Vo');
  } else if (baseType.endsWith('Entity')) {
    voType = baseType.replace('Entity', 'Vo');
  } else {
    // 其他类型保持不变或映射
    voType = mapTsTypeToVoType(baseType);
  }

  return isArray ? `${voType}[]` : voType;
}

/**
 * 将 DTO 字段转换为 VO 字段定义
 */
export function convertDtoFieldToVo(field: DtoField): string | null {
  if (!field.name || !field.type) return null;

  let voType = convertDtoTypeToVoType(field.type);
  
  // 处理复杂对象类型，确保语法正确
  if (voType.startsWith('{')) {
    // 清理和格式化对象类型
    voType = voType
      .replace(/\s+/g, ' ')  // 压缩空格
      .replace(/{\s*;/g, '{ ')   // 移除开头的分号
      .replace(/;\s*}/g, ' }')   // 确保分号和大括号格式正确
      .replace(/}\s*\[\]/g, '}[]')  // 确保数组标记格式正确
      .trim();
    
    // 修复常见的语法问题
    if (voType.includes('{;')) {
      voType = voType.replace('{;', '{');
    }
  }
  
  const optional = field.optional ? '?' : '';
  return `${field.name}${optional}: ${voType};`;
}

/**
 * 获取类型复杂度（用于字段去重时的优先级判断）
 */
export function getTypeComplexity(type: string): number {
  if (type === 'any') return 0;
  if (['string', 'number', 'boolean'].includes(type)) return 1;
  if (type.includes('|') || type.includes('&')) return 3;
  if (type.endsWith('Vo') || type.endsWith('Dto')) return 2;
  return 1;
}
