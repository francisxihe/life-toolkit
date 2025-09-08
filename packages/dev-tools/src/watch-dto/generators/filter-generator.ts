import { DtoClass } from '../types/index';
import { parseInheritanceInfo, convertIntersectionTypeToVo } from '../parsers/inheritance-parser';
import { filterNonRelationFields } from '../utils/field-utils';
import { convertDtoFieldToVo } from '../utils/type-mapping';

/**
 * 生成 Filter VO - 基于继承信息生成类型组合
 */
export function generateFilterVo(dtoClass: DtoClass): string {
  const lines: string[] = [];
  
  const baseName = dtoClass.name.replace('FilterDto', '').replace('Dto', '');
  const filterVoName = `${baseName}FilterVo`;
  
  const inheritanceInfo = parseInheritanceInfo(dtoClass.classDefinition || '');
  
  if (inheritanceInfo.type === 'intersection') {
    // IntersectionType: 直接用 & 组合 VO 类型
    const voTypes = inheritanceInfo.info.types.map((type: string) => 
      convertIntersectionTypeToVo(type)
    );
    
    // 添加直接定义的字段（排除方法）
    const customFields = filterNonRelationFields(dtoClass.fields).filter(field => 
      !field.name.includes('(') && !field.name.includes('import')
    );
    
    if (customFields.length > 0) {
      lines.push(`export type ${filterVoName} = {`);
      for (const field of customFields) {
        const voField = convertDtoFieldToVo(field);
        if (voField) {
          lines.push(`  ${voField}`);
        }
      }
      lines.push(`} & ${voTypes.join(' & ')};`);
    } else {
      lines.push(`export type ${filterVoName} = ${voTypes.join(' & ')};`);
    }
  } else {
    // 非 IntersectionType，直接基于字段生成
    lines.push(`export type ${filterVoName} = {`);
    const nonRelationFields = filterNonRelationFields(dtoClass.fields);
    for (const field of nonRelationFields) {
      const voField = convertDtoFieldToVo(field);
      if (voField) {
        lines.push(`  ${voField}`);
      }
    }
    lines.push(`};`);
  }

  return lines.join('\n');
}

/**
 * 生成 PageFilter VO（包含 pageNum 和 pageSize 字段）
 */
export function generatePageFilterVo(dtoClass: DtoClass): string {
  const lines: string[] = [];
  
  // 生成基础 Filter VO 名称
  const baseName = dtoClass.name.replace('PageDto', '').replace('Dto', '').replace('Page', '').replace('Filter', '');
  const baseFilterVoName = `${baseName}FilterVo`;
  const pageFilterVoName = `${baseName}PageFilterVo`;
  
  lines.push(`export type ${pageFilterVoName} = ${baseFilterVoName} & {`);
  lines.push('  pageNum: number;');
  lines.push('  pageSize: number;');
  lines.push('};');
  
  return lines.join('\n');
}
