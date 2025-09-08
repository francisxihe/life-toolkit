import { DtoClass, DtoField } from '../types/index';
import { parseClassFields } from './field-parser';
import { deduplicateFields } from '../utils/field-utils';
import { validateDtoClass, isFilterClass, isFormClass } from '../utils/validation';

/**
 * 解析 DTO 类
 */
export function parseDtoClasses(content: string, dtoFilePath?: string): DtoClass[] {
  const classes: DtoClass[] = [];

  // 匹配所有类定义，包含完整的类体
  const classRegex = /export\s+class\s+(\w+)[\s\S]*?(?=export\s+class|$)/g;
  let match;

  while ((match = classRegex.exec(content)) !== null) {
    const [fullMatch, className] = match;

    // 确定类型
    let type: 'model' | 'filter' | 'form' = 'model';
    if (isFilterClass(className)) {
      type = 'filter';
    } else if (isFormClass(className)) {
      type = 'form';
    }

    // 解析类字段
    const directFields = parseClassFields(fullMatch);
    
    // 合并字段（现在不解析继承字段，只保留直接定义的字段）
    const fields = directFields;

    // 字段去重处理
    const deduplicatedFields = deduplicateFields(fields);

    const dtoClass: DtoClass = {
      name: className,
      type,
      fields: deduplicatedFields,
      imports: [],
      classDefinition: fullMatch,
    };

    // 验证并添加到结果中
    if (validateDtoClass(dtoClass)) {
      classes.push(dtoClass);
    }
  }

  return classes;
}

/**
 * 提取导入语句
 */
export function extractImports(content: string): string[] {
  const imports: string[] = [];
  const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"];?/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[0]);
  }

  return imports;
}

/**
 * 根据 DTO 类型确定对应的 VO 文件类型
 */
export function getVoFileType(dtoClass: DtoClass): 'model' | 'filter' | 'form' {
  return dtoClass.type;
}

/**
 * 获取基础名称（移除 Dto 后缀和类型前缀）
 */
export function getBaseName(className: string): string {
  let baseName = className.replace('Dto', '');
  
  // 移除类型前缀
  if (baseName.startsWith('Create')) {
    baseName = baseName.replace('Create', '');
  } else if (baseName.startsWith('Update')) {
    baseName = baseName.replace('Update', '');
  } else if (baseName.endsWith('Filter')) {
    baseName = baseName.replace('Filter', '');
  } else if (baseName.includes('Page')) {
    baseName = baseName.replace('Page', '').replace('Filter', '');
  }
  
  return baseName;
}
