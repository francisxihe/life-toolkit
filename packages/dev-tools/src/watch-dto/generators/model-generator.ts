import { DtoClass } from '../types/index';
import { filterNonRelationFields, filterRelationFields } from '../utils/field-utils';
import { convertDtoFieldToVo } from '../utils/type-mapping';

/**
 * 生成单个 VO 类型（用于 Model 类型）
 */
export function generateSingleVo(dtoClass: DtoClass): string {
  const lines: string[] = [];
  const voName = dtoClass.name.replace('Dto', 'Vo');

  lines.push(`export type ${voName} = {`);

  for (const field of dtoClass.fields) {
    const voField = convertDtoFieldToVo(field);
    if (voField) {
      lines.push(`  ${voField}`);
    }
  }

  lines.push('};');

  return lines.join('\n');
}

/**
 * 生成 WithoutRelations VO 类型
 */
export function generateWithoutRelationsVo(dtoClass: DtoClass): string {
  const lines: string[] = [];
  const baseName = dtoClass.name.replace('Dto', '').replace('Model', '').replace('WithoutRelations', '');
  const voName = `${baseName}WithoutRelationsVo`;

  lines.push(`export type ${voName} = {`);

  // 只包含非关系字段
  const nonRelationFields = filterNonRelationFields(dtoClass.fields);
  for (const field of nonRelationFields) {
    const voField = convertDtoFieldToVo(field);
    if (voField) {
      lines.push(`  ${voField}`);
    }
  }

  lines.push('} & BaseEntityVo;');

  return lines.join('\n');
}

/**
 * 生成完整的 Model VO（WithoutRelations + 关系字段）
 */
export function generateFullModelVo(mainClass: DtoClass, withoutRelationsExists: boolean): string {
  const lines: string[] = [];
  const baseName = mainClass.name.replace('Dto', '').replace('Model', '');
  const voName = `${baseName}Vo`;
  const withoutRelationsVoName = `${baseName}WithoutRelationsVo`;

  if (withoutRelationsExists) {
    // 提取关系字段
    const relationFields = filterRelationFields(mainClass.fields);

    if (relationFields.length > 0) {
      lines.push(`export type ${voName} = ${withoutRelationsVoName} & {`);

      // 去重关系字段
      const uniqueRelationFields = new Map<string, (typeof relationFields)[0]>();
      for (const field of relationFields) {
        const existing = uniqueRelationFields.get(field.name);
        if (!existing) {
          uniqueRelationFields.set(field.name, field);
        } else {
          // 优先保留 VO 类型，其次 DTO 类型，最后才是实体类型
          const currentPriority = field.type.endsWith('Vo') ? 3 : field.type.endsWith('Dto') ? 2 : 1;
          const existingPriority = existing.type.endsWith('Vo') ? 3 : existing.type.endsWith('Dto') ? 2 : 1;
          if (currentPriority > existingPriority) {
            uniqueRelationFields.set(field.name, field);
          }
        }
      }

      for (const field of uniqueRelationFields.values()) {
        const voField = convertDtoFieldToVo(field);
        if (voField) {
          lines.push(`  ${voField}`);
        }
      }

      lines.push('};');
    } else {
      // 如果没有关系字段，直接使用 WithoutRelationsVo
      lines.push(`export type ${voName} = ${withoutRelationsVoName};`);
    }
  } else {
    // 如果没有 WithoutRelationsVo，直接生成完整的 VO
    return generateSingleVo(mainClass);
  }

  return lines.join('\n');
}
