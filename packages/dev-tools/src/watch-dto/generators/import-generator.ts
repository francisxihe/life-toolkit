import { DtoClass } from '../types/index';
import path from 'path';

/**
 * 生成 VO 文件的导入语句
 */
export function generateVoImports(dtoClasses: DtoClass[], dtoFilePath: string): string[] {
  const imports: string[] = [];
  const importSet = new Set<string>();

  // 分析需要的导入
  for (const dtoClass of dtoClasses) {
    // 检查是否需要 BaseEntityVo
    if (dtoClass.name.includes('WithoutRelations') || dtoClass.type === 'model') {
      importSet.add('BaseEntityVo');
    }

    // 检查是否需要 BaseFilterVo
    if (dtoClass.type === 'filter') {
      importSet.add('BaseFilterVo');
    }

    // 检查字段中的关联类型
    for (const field of dtoClass.fields) {
      const fieldType = field.type.replace('[]', '');

      // 检查是否需要导入其他 VO 类型
      if (['Goal', 'Task', 'Todo', 'Habit', 'TrackTime', 'User'].includes(fieldType)) {
        const voType = `${fieldType}Vo`;
        importSet.add(voType);
      }
    }
  }

  // 生成导入语句
  if (importSet.has('BaseEntityVo') || importSet.has('BaseFilterVo')) {
    const baseImports: string[] = [];
    if (importSet.has('BaseEntityVo')) baseImports.push('BaseEntityVo');
    if (importSet.has('BaseFilterVo')) baseImports.push('BaseFilterVo');

    imports.push(`import { ${baseImports.join(', ')} } from '../../common';`);
  }

  // 生成关联 VO 的导入
  const voImports = Array.from(importSet).filter((imp) => imp.endsWith('Vo') && !imp.includes('Base'));

  if (voImports.length > 0) {
    // 根据文件路径确定相对导入路径
    const relativeImports = generateRelativeImports(voImports, dtoFilePath);
    imports.push(...relativeImports);
  }

  return imports;
}

/**
 * 生成相对路径的导入语句
 */
function generateRelativeImports(voTypes: string[], dtoFilePath: string): string[] {
  const imports: string[] = [];

  // 根据 VO 类型分组
  const importGroups: Record<string, string[]> = {};

  for (const voType of voTypes) {
    const moduleName = voType.replace('Vo', '').toLowerCase();
    const importPath = `../${moduleName}/${moduleName}-model.vo`;

    if (!importGroups[importPath]) {
      importGroups[importPath] = [];
    }
    importGroups[importPath].push(voType);
  }

  // 生成导入语句
  for (const [importPath, types] of Object.entries(importGroups)) {
    imports.push(`import { ${types.join(', ')} } from '${importPath}';`);
  }

  return imports;
}

/**
 * 从现有内容中提取导入语句
 */
export function extractImportsFromContent(content: string): string | null {
  const lines = content.split('\n');
  const importLines: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith('import ')) {
      importLines.push(line);
    } else if (line.trim() === '' && importLines.length > 0) {
      // 空行，继续收集
      continue;
    } else if (importLines.length > 0) {
      // 遇到非导入语句，停止收集
      break;
    }
  }

  return importLines.length > 0 ? importLines.join('\n') : null;
}

/**
 * 从内容中移除导入语句
 */
export function removeImportsFromContent(content: string): string {
  const lines = content.split('\n');
  let startIndex = 0;

  // 找到第一个非导入、非空行的位置
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line !== '' && !line.startsWith('import ')) {
      startIndex = i;
      break;
    }
  }

  return lines.slice(startIndex).join('\n');
}
