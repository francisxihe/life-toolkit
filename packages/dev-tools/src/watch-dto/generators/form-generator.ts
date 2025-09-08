import { DtoClass } from '../types/index';
import { parseInheritanceInfo } from '../parsers/inheritance-parser';
import { filterNonRelationFields } from '../utils/field-utils';
import { convertDtoFieldToVo } from '../utils/type-mapping';

/**
 * 生成 Form VO - 基于继承信息生成类型组合
 */
export function generateFormVo(dtoClass: DtoClass, prefix: 'Create' | 'Update'): string {
  const lines: string[] = [];

  let baseName = dtoClass.name.replace('Dto', '');
  if (baseName.startsWith('Create')) {
    baseName = baseName.replace('Create', '');
  } else if (baseName.startsWith('Update')) {
    baseName = baseName.replace('Update', '');
  }

  const voName = `${prefix}${baseName}Vo`;

  if (prefix === 'Update') {
    // Update VO 使用 Partial<Create VO>
    const createVoName = `Create${baseName}Vo`;
    lines.push(`export type ${voName} = Partial<${createVoName}>;`);
  } else {
    // Create VO 基于继承信息生成
    const inheritanceInfo = parseInheritanceInfo(dtoClass.classDefinition || '');
    
    if (inheritanceInfo.type === 'pick') {
      // PickType: Pick<SourceVo, 'field1' | 'field2'>
      const sourceVoName = inheritanceInfo.info.sourceClass.replace('Dto', 'WithoutRelationsVo');
      const fieldList = inheritanceInfo.info.fields.map((f: string) => `'${f}'`).join(' | ');
      
      // 添加直接定义的字段
      const customFields = filterNonRelationFields(dtoClass.fields);
      
      if (customFields.length > 0) {
        lines.push(`export type ${voName} = Pick<${sourceVoName}, ${fieldList}> & {`);
        for (const field of customFields) {
          const voField = convertDtoFieldToVo(field);
          if (voField) {
            lines.push(`  ${voField}`);
          }
        }
        lines.push('};');
      } else {
        lines.push(`export type ${voName} = Pick<${sourceVoName}, ${fieldList}>;`);
      }
    } else {
      // 简单类型，直接基于字段生成
      lines.push(`export type ${voName} = {`);
      const nonRelationFields = filterNonRelationFields(dtoClass.fields);
      for (const field of nonRelationFields) {
        const voField = convertDtoFieldToVo(field);
        if (voField) {
          lines.push(`  ${voField}`);
        }
      }
      lines.push('};');
    }
  }

  return lines.join('\n');
}
