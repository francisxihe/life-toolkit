import { InheritanceInfo, PickTypeInfo, IntersectionTypeInfo } from '../types/index';

/**
 * 解析继承信息，但不展开字段，而是保存继承结构
 */
export function parseInheritanceInfo(classBody: string): InheritanceInfo {
  // 检查 PickType
  const pickTypeMatch = classBody.match(/extends\s+PickType\(([^,]+),\s*\[([^\]]+)\]/);
  if (pickTypeMatch) {
    const [, sourceClass, fieldsStr] = pickTypeMatch;
    const fieldNames = fieldsStr
      .split(',')
      .map((f) =>
        f
          .trim()
          .replace(/[\"']/g, '')
          .replace(/as const/, '')
          .trim()
      )
      .filter((f) => f.length > 0);

    return {
      type: 'pick',
      info: { sourceClass: sourceClass.trim(), fields: fieldNames } as PickTypeInfo,
    };
  }

  // 检查 IntersectionType
  const intersectionMatch = classBody.match(/extends\s+IntersectionType\(([\s\S]*?)\)\s*{/);
  if (intersectionMatch) {
    const [, typesStr] = intersectionMatch;
    const cleanTypesStr = typesStr.replace(/\s+/g, ' ').trim();
    const types = parseIntersectionTypes(cleanTypesStr);

    return {
      type: 'intersection',
      info: { types } as IntersectionTypeInfo,
    };
  }

  return { type: 'simple', info: {} };
}

/**
 * 解析 IntersectionType 中的类型列表
 */
export function parseIntersectionTypes(typesStr: string): string[] {
  const types: string[] = [];
  let depth = 0;
  let current = '';
  let i = 0;

  while (i < typesStr.length) {
    const char = typesStr[i];

    if (char === '(') {
      depth++;
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      // 顶层逗号，分割类型
      if (current.trim()) {
        types.push(current.trim());
      }
      current = '';
    } else {
      current += char;
    }

    i++;
  }

  // 添加最后一个类型
  if (current.trim()) {
    types.push(current.trim());
  }

  return types;
}

/**
 * 将 DTO 类型转换为对应的 VO 类型（用于 IntersectionType）
 */
export function convertIntersectionTypeToVo(type: string): string {
  if (type.includes('PartialType') && type.includes('PickType')) {
    // PartialType(PickType(SourceDto, [...]))
    const match = type.match(/PartialType\s*\(\s*PickType\(([^,]+),\s*\[([^\]]+)\]/);
    if (match) {
      const [, sourceClass, fieldsStr] = match;
      const sourceVoName = sourceClass.trim().replace('Dto', 'WithoutRelationsVo');
      const fieldList = fieldsStr
        .split(',')
        .map(
          (f: string) =>
            `'${f
              .trim()
              .replace(/[\"']/g, '')
              .replace(/as const/, '')
              .trim()}'`
        )
        .filter((f) => f !== "''")
        .join(' | ');
      return `Partial<Pick<${sourceVoName}, ${fieldList}>>`;
    }
  } else if (type.includes('PickType')) {
    // PickType(SourceDto, [...])
    const match = type.match(/PickType\(([^,]+),\s*\[([^\]]+)\]/);
    if (match) {
      const [, sourceClass, fieldsStr] = match;
      const sourceVoName = sourceClass.trim().replace('Dto', 'WithoutRelationsVo');
      const fieldList = fieldsStr
        .split(',')
        .map(
          (f: string) =>
            `'${f
              .trim()
              .replace(/[\"']/g, '')
              .replace(/as const/, '')
              .trim()}'`
        )
        .filter((f) => f !== "''")
        .join(' | ');
      return `Pick<${sourceVoName}, ${fieldList}>`;
    }
  }

  // 简单类型直接转换
  if (type.includes('BaseFilterDto')) {
    return 'BaseFilterVo';
  }
  return type.replace('Dto', 'Vo');
}
