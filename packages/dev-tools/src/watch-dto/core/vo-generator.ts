import { DtoClass } from '../types/index';
import { generateVoImports } from '../generators/import-generator';
import { generateSingleVo, generateWithoutRelationsVo, generateFullModelVo } from '../generators/model-generator';
import { generateFormVo } from '../generators/form-generator';
import { generateFilterVo, generatePageFilterVo } from '../generators/filter-generator';
import { getBaseName } from '../parsers/dto-parser';
import { isWithoutRelationsClass } from '../utils/validation';

/**
 * 生成 VO 内容的核心逻辑
 */
export function generateVoContent(dtoClasses: DtoClass[], dtoFilePath: string): string {
  const lines: string[] = [];

  // 生成导入语句
  const imports = generateVoImports(dtoClasses, dtoFilePath);
  lines.push(...imports, '');

  // 分离不同类型的 DTO 类
  const withoutRelationsClasses = dtoClasses.filter((dto) => isWithoutRelationsClass(dto.name) && dto.type === 'model');
  const mainClasses = dtoClasses.filter((dto) => !isWithoutRelationsClass(dto.name) && dto.type === 'model');
  const otherClasses = dtoClasses.filter((dto) => dto.type !== 'model');

  const generatedVoNames = new Set<string>();

  // 1. 先生成 WithoutRelationsVo 类型
  for (const dtoClass of withoutRelationsClasses) {
    const baseName = getBaseName(dtoClass.name.replace('WithoutRelations', ''));
    const voName = `${baseName}WithoutRelationsVo`;

    if (!generatedVoNames.has(voName)) {
      generatedVoNames.add(voName);
      const voContent = generateWithoutRelationsVo(dtoClass, dtoFilePath);
      lines.push(voContent, '');
    }
  }

  // 2. 生成主要的 VO 类型（WithoutRelationsVo + 关系字段的并集）
  for (const mainClass of mainClasses) {
    const baseName = getBaseName(mainClass.name);
    const voName = `${baseName}Vo`;

    if (!generatedVoNames.has(voName)) {
      generatedVoNames.add(voName);

      // 检查是否存在对应的 WithoutRelationsVo
      const hasWithoutRelations = withoutRelationsClasses.some(
        (cls) => getBaseName(cls.name.replace('WithoutRelations', '')) === baseName
      );

      const voContent = generateFullModelVo(mainClass, hasWithoutRelations);
      lines.push(voContent, '');
    }
  }

  // 3. 处理其他类型（Form、Filter 等）
  for (const dtoClass of otherClasses) {
    if (dtoClass.type === 'form') {
      generateFormVos(dtoClass, lines, generatedVoNames);
    } else if (dtoClass.type === 'filter') {
      generateFilterVos(dtoClass, lines, generatedVoNames);
    }
  }

  return lines.join('\n').trim() + '\n';
}

/**
 * 生成 Form VO 类型
 */
function generateFormVos(dtoClass: DtoClass, lines: string[], generatedVoNames: Set<string>): void {
  if (dtoClass.name.startsWith('Create')) {
    const baseName = getBaseName(dtoClass.name);
    const voName = `Create${baseName}Vo`;

    if (!generatedVoNames.has(voName)) {
      generatedVoNames.add(voName);
      const voContent = generateFormVo(dtoClass, 'Create');
      lines.push(voContent, '');
    }
  } else if (dtoClass.name.startsWith('Update')) {
    const baseName = getBaseName(dtoClass.name);
    const voName = `Update${baseName}Vo`;

    if (!generatedVoNames.has(voName)) {
      generatedVoNames.add(voName);
      const voContent = generateFormVo(dtoClass, 'Update');
      lines.push(voContent, '');
    }
  }
}

/**
 * 生成 Filter VO 类型
 */
function generateFilterVos(dtoClass: DtoClass, lines: string[], generatedVoNames: Set<string>): void {
  const baseName = getBaseName(dtoClass.name);

  if (dtoClass.name.includes('Page')) {
    // PageFilter 类型特殊处理
    const voName = `${baseName}PageFilterVo`;

    if (!generatedVoNames.has(voName)) {
      generatedVoNames.add(voName);
      const voContent = generatePageFilterVo(dtoClass);
      lines.push(voContent, '');
    }
  } else {
    const voName = `${baseName}FilterVo`;

    if (!generatedVoNames.has(voName)) {
      generatedVoNames.add(voName);
      const voContent = generateFilterVo(dtoClass);
      lines.push(voContent, '');
    }
  }
}
