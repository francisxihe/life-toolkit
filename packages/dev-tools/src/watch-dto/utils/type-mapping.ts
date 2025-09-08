import { DtoField } from '../types';

/**
 * TypeScript 类型到 VO 类型的映射
 */
export function mapTsTypeToVoType(tsType: string): string {
  const typeMap: Record<string, string> = {
    'string': 'string',
    'number': 'number',
    'boolean': 'boolean',
    'Date': 'string',
    'any': 'any',
    'unknown': 'unknown',
    'void': 'void',
    'null': 'null',
    'undefined': 'undefined',
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
  } else if (baseType.endsWith('Entity')) {
    voType = baseType.replace('Entity', 'Vo');
  } else {
    voType = mapTsTypeToVoType(baseType);
  }

  return isArray ? `${voType}[]` : voType;
}

/**
 * 将 DTO 字段转换为 VO 字段定义
 */
export function convertDtoFieldToVo(field: DtoField): string | null {
  if (!field.name || field.name.trim() === '') {
    return null;
  }

  const voType = convertDtoTypeToVoType(field.type);
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
