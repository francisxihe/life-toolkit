import { DtoClass } from '../types/index';
import { parseEntityFields, getEntityNameFromDto, buildEntityPath } from '../parsers/entity-parser';
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
 * 直接从实体文件解析字段，避免硬编码
 */
export function generateWithoutRelationsVo(dtoClass: DtoClass, dtoFilePath: string): string {
  const lines: string[] = [];
  const baseName = dtoClass.name.replace('Dto', '').replace('Model', '').replace('WithoutRelations', '');
  const voName = `${baseName}WithoutRelationsVo`;

  // 对于 WithoutRelationsDto，检查是否有自定义字段
  if (dtoClass.name.includes('WithoutRelations')) {
    // 检查是否有自定义字段（除了标准关系字段）
    const hasCustomFields = dtoClass.fields.some(
      (field) => !['task', 'habit', 'repeat', 'goal', 'parent', 'children', 'trackTimes'].includes(field.name)
    );

    if (hasCustomFields) {
      // 如果有自定义字段，使用 DTO 字段
      lines.push(`export type ${voName} = {`);
      const nonRelationFields = filterNonRelationFields(dtoClass.fields, dtoClass.name);
      for (const field of nonRelationFields) {
        const voField = convertDtoFieldToVo(field);
        if (voField) {
          lines.push(`  ${voField}`);
        }
      }
      lines.push('} & BaseEntityVo;');
    } else {
      // 没有自定义字段，使用实体字段
      const entityName = getEntityNameFromDto(dtoClass.name);
      const entityFilePath = buildEntityPath(dtoFilePath, entityName);

      try {
        const fs = require('fs');
        const entityContent = fs.readFileSync(entityFilePath, 'utf8');
        const entityFields = parseEntityFields(entityContent, entityName);

        if (entityFields.length > 0) {
          lines.push(`export type ${voName} = {`);
          const nonRelationFields = filterNonRelationFields(entityFields);
          for (const field of nonRelationFields) {
            const voField = convertDtoFieldToVo(field);
            if (voField) {
              lines.push(`  ${voField}`);
            }
          }
          lines.push('} & BaseEntityVo;');
        } else {
          // 回退到 DTO 字段
          lines.push(`export type ${voName} = {`);
          const nonRelationFields = filterNonRelationFields(dtoClass.fields, dtoClass.name);
          for (const field of nonRelationFields) {
            const voField = convertDtoFieldToVo(field);
            if (voField) {
              lines.push(`  ${voField}`);
            }
          }
          lines.push('} & BaseEntityVo;');
        }
      } catch (error) {
        console.warn(`无法读取实体文件 ${entityFilePath}:`, error);
        // 回退到 DTO 字段
        lines.push(`export type ${voName} = {`);
        const nonRelationFields = filterNonRelationFields(dtoClass.fields, dtoClass.name);
        for (const field of nonRelationFields) {
          const voField = convertDtoFieldToVo(field);
          if (voField) {
            lines.push(`  ${voField}`);
          }
        }
        lines.push('} & BaseEntityVo;');
      }
    }
  } else {
    // 非 WithoutRelationsDto，检查是否有自定义字段
    const hasCustomFields = dtoClass.fields.some(
      (field) => !['task', 'habit', 'repeat', 'goal', 'parent', 'children', 'trackTimes'].includes(field.name)
    );

    if (hasCustomFields) {
      // 如果有自定义字段，使用 DTO 字段而不是实体字段
      lines.push(`export type ${voName} = {`);
      const nonRelationFields = filterNonRelationFields(dtoClass.fields, dtoClass.name);
      for (const field of nonRelationFields) {
        const voField = convertDtoFieldToVo(field);
        if (voField) {
          lines.push(`  ${voField}`);
        }
      }
      lines.push('} & BaseEntityVo;');
    } else {
      // 没有自定义字段，使用原有的实体字段逻辑
      const entityName = getEntityNameFromDto(dtoClass.name);
      const entityFilePath = buildEntityPath('', entityName);

      try {
        const fs = require('fs');
        const entityContent = fs.readFileSync(entityFilePath, 'utf8');
        const entityFields = parseEntityFields(entityContent, entityName);

        if (entityFields.length > 0) {
          lines.push(`export type ${voName} = {`);
          const nonRelationFields = filterNonRelationFields(entityFields);
          for (const field of nonRelationFields) {
            const voField = convertDtoFieldToVo(field);
            if (voField) {
              lines.push(`  ${voField}`);
            }
          }
          lines.push('} & BaseEntityVo;');
        } else {
          // 回退到 DTO 字段
          lines.push(`export type ${voName} = {`);
          const nonRelationFields = filterNonRelationFields(dtoClass.fields, dtoClass.name);
          for (const field of nonRelationFields) {
            const voField = convertDtoFieldToVo(field);
            if (voField) {
              lines.push(`  ${voField}`);
            }
          }
          lines.push('} & BaseEntityVo;');
        }
      } catch (error) {
        // 回退到 DTO 字段
        lines.push(`export type ${voName} = {`);
        const nonRelationFields = filterNonRelationFields(dtoClass.fields, dtoClass.name);
        for (const field of nonRelationFields) {
          const voField = convertDtoFieldToVo(field);
          if (voField) {
            lines.push(`  ${voField}`);
          }
        }
        lines.push('} & BaseEntityVo;');
      }
    }
  }

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
    // 检查主类是否有额外的非关系字段（不在 WithoutRelations 中的字段）
    const relationFields = filterRelationFields(mainClass.fields);
    const nonRelationFields = filterNonRelationFields(mainClass.fields, mainClass.name);

    // 检查是否有自定义非关系字段（如 repeatConfig）
    const hasCustomNonRelationFields = nonRelationFields.some(
      (field) =>
        ![
          'name',
          'description',
          'status',
          'planDate',
          'planStartAt',
          'planEndAt',
          'importance',
          'urgency',
          'tags',
          'taskId',
          'doneAt',
          'abandonedAt',
          'source',
          'repeatId',
          'habitId',
        ].includes(field.name)
    );

    if (relationFields.length > 0 || hasCustomNonRelationFields) {
      lines.push(`export type ${voName} = ${withoutRelationsVoName} & {`);

      // 添加自定义非关系字段
      if (hasCustomNonRelationFields) {
        for (const field of nonRelationFields) {
          if (
            ![
              'name',
              'description',
              'status',
              'planDate',
              'planStartAt',
              'planEndAt',
              'importance',
              'urgency',
              'tags',
              'taskId',
              'doneAt',
              'abandonedAt',
              'source',
              'repeatId',
              'habitId',
            ].includes(field.name)
          ) {
            const voField = convertDtoFieldToVo(field);
            if (voField) {
              lines.push(`  ${voField}`);
            }
          }
        }
      }

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
      // 如果没有关系字段和自定义字段，直接使用 WithoutRelationsVo
      lines.push(`export type ${voName} = ${withoutRelationsVoName};`);
    }
  } else {
    // 如果没有 WithoutRelationsVo，直接生成完整的 VO
    return generateSingleVo(mainClass);
  }

  return lines.join('\n');
}
