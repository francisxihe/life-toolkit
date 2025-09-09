import { DtoField } from '../types/index';
import { getTypeComplexity } from './type-mapping';

/**
 * 检查是否为关系字段
 */
export function checkIsRelationField(field: DtoField): boolean {
  // 如果类型包含索引访问语法（如 SomeDto['field']），不应被视为关系字段
  if (field.type.includes('[') && field.type.includes(']')) {
    return false;
  }

  // 如果类型包含内联对象定义（包含大括号），不应被视为关系字段
  if (field.type.includes('{') && field.type.includes('}')) {
    return false;
  }

  return (
    // 实体类型
    ['Task', 'Todo', 'Goal', 'Habit', 'TrackTime', 'User'].some(
      (entity) => field.type === entity || field.type === `${entity}[]`
    ) ||
    // DTO 类型（但排除索引访问类型）
    field.type.endsWith('Dto') ||
    field.type.endsWith('Dto[]') ||
    // VO 类型
    field.type.endsWith('Vo') ||
    field.type.endsWith('Vo[]') ||
    // 复杂关系类型
    ['TodoRepeat', 'TaskRepeat', 'GoalRepeat', 'HabitRepeat'].includes(field.type) ||
    // any 类型
    field.type === 'any'
  );
}

/**
 * 检查是否为导入方法
 */
export function isImportMethod(fieldName: string): boolean {
  return [
    'importVo',
    'importCreateVo',
    'importUpdateVo',
    'importEntity',
    'importUpdateEntity',
    'exportCreateEntity',
    'exportUpdateEntity',
    'appendToCreateEntity',
    'appendToUpdateEntity',
    'importListVo',
    'importPageVo',
  ].includes(fieldName);
}

/**
 * 字段去重函数（优先保留类中直接定义的字段）
 */
export function deduplicateFields(fields: DtoField[]): DtoField[] {
  const fieldMap = new Map<string, DtoField>();

  // 先收集所有字段，后面的字段会覆盖前面的（优先保留类中直接定义的）
  for (const field of fields) {
    const existingField = fieldMap.get(field.name);
    if (!existingField) {
      fieldMap.set(field.name, field);
    } else {
      // 如果字段已存在，优先保留更具体的类型（通常是类中直接定义的）
      // 比较类型复杂度，优先保留关联类型而不是基础类型
      const newTypeComplexity = getTypeComplexity(field.type);
      const existingTypeComplexity = getTypeComplexity(existingField.type);

      if (newTypeComplexity > existingTypeComplexity) {
        fieldMap.set(field.name, field);
      } else if (newTypeComplexity === existingTypeComplexity) {
        // 复杂度相同时，优先保留可选性更明确的字段
        if (field.optional !== existingField.optional) {
          // 优先保留非可选字段
          if (!field.optional) {
            fieldMap.set(field.name, field);
          }
        }
      }
    }
  }

  return Array.from(fieldMap.values());
}

/**
 * 过滤出非关系字段
 */
export function filterNonRelationFields(fields: DtoField[], className?: string): DtoField[] {
  if (className === 'TodoDto') {
    console.log(
      `[DEBUG] filterNonRelationFields input for ${className}:`,
      fields.map((f) => `${f.name}: ${f.type}`)
    );
  }

  const filtered = fields.filter((field) => !checkIsRelationField(field));

  if (className === 'TodoDto') {
    console.log(
      `[DEBUG] filterNonRelationFields output for ${className}:`,
      filtered.map((f) => `${f.name}: ${f.type}`)
    );
  }

  return filtered;
}

/**
 * 过滤出关系字段
 */
export function filterRelationFields(fields: DtoField[]): DtoField[] {
  return fields.filter((field) => checkIsRelationField(field));
}
