import path from 'path';
import { GoalType, GoalStatus, Importance, Difficulty } from '@life-toolkit/enum';

export interface DtoClass {
  name: string;
  type: 'model' | 'form' | 'filter';
  fields: DtoField[];
  imports: string[];
  extends?: string;
}

export interface DtoField {
  name: string;
  type: string;
  optional: boolean;
  isArray: boolean;
  decorators: string[];
}

// 解析 DTO 类
export function parseDtoClasses(content: string, dtoFilePath?: string): DtoClass[] {
  const classes: DtoClass[] = [];
  
  // 匹配所有类定义，包含完整的类体
  const classRegex = /export\s+class\s+(\w+)[\s\S]*?(?=export\s+class|$)/g;
  let match;
  
  while ((match = classRegex.exec(content)) !== null) {
    const [fullMatch, className] = match;
    
    
    // 确定 DTO 类型
    let type: 'model' | 'filter' | 'form' = 'model';
    if (className.toLowerCase().includes('filter')) {
      type = 'filter';
    } else if (className.toLowerCase().includes('form')) {
      type = 'form';
    }
    
    // 解析类字段
    const fields = parseClassFields(fullMatch);
    
    
    // 动态解析实体字段
    const entityFields = extractEntityFields(content, dtoFilePath);
    
    // 合并字段
    const allFields = [...fields, ...entityFields];
    
    classes.push({
      name: className,
      type,
      fields: allFields,
      imports: []
    });
  }
  
  return classes;
}

// 提取导入语句
function extractImports(content: string): string[] {
  const imports: string[] = [];
  const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"];?/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

// 从实体文件中动态解析字段
function extractEntityFields(content: string, dtoFilePath?: string): DtoField[] {
  const fields: DtoField[] = [];
  
  // 解析实体导入和 IntersectionType 引用
  const entityRefs = extractEntityReferences(content);
  
  for (const entityRef of entityRefs) {
    const entityFields = parseEntityFile(entityRef.filePath, entityRef.className, dtoFilePath);
    fields.push(...entityFields);
  }
  
  return fields;
}

// 提取实体引用信息
function extractEntityReferences(content: string): Array<{className: string, filePath: string}> {
  const refs: Array<{className: string, filePath: string}> = [];
  
  // 查找实体导入
  const entityImportMatches = content.matchAll(/import\s+{\s*([^}]+)\s+}\s+from\s+['"]([^'"]*\.entity)['"]/g);
  
  for (const match of entityImportMatches) {
    const imports = match[1].split(',').map(s => s.trim());
    const importPath = match[2];
    
    imports.forEach(imp => {
      const className = imp.replace(/\s+as\s+\w+/, '').trim();
      if (className) {
        refs.push({ className, filePath: importPath });
      }
    });
  }
  
  return refs;
}

// 解析实体文件中的字段定义
function parseEntityFile(relativePath: string, className: string, dtoFilePath?: string): DtoField[] {
  const path = require('path');
  const fs = require('fs');
  
  try {
    // 构建实体文件的绝对路径
    const { ROOT } = require('../constants');
    
    let entityPath: string;
    if (dtoFilePath && relativePath.startsWith('../')) {
      // 基于 DTO 文件路径解析相对路径
      const dtoDir = path.dirname(dtoFilePath);
      entityPath = path.resolve(dtoDir, relativePath + '.ts');
    } else {
      // 默认处理
      const SERVER_BASE = path.join(ROOT, 'packages/business/server/src');
      entityPath = path.resolve(SERVER_BASE, relativePath + '.ts');
    }
    
    if (!fs.existsSync(entityPath)) {
      console.warn(`Entity file not found: ${entityPath}`);
      return [];
    }
    
    const entityContent = fs.readFileSync(entityPath, 'utf-8');
    return parseEntityClass(entityContent, className);
  } catch (error) {
    console.warn(`Failed to parse entity file: ${relativePath}`, error.message);
    return [];
  }
}

// 解析实体类中的字段
function parseEntityClass(content: string, className: string): DtoField[] {
  const fields: DtoField[] = [];
  
  // 匹配类定义
  const classRegex = new RegExp(`export\\s+class\\s+${className}\\s*(?:extends\\s+[^{]+)?\\s*{([\\s\\S]*?)^}`, 'm');
  const classMatch = content.match(classRegex);
  
  if (!classMatch) {
    return fields;
  }
  
  const classBody = classMatch[1];
  
  // 预处理：移除所有装饰器和注释
  const cleanedBody = classBody
    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
    .replace(/\/\/.*$/gm, '') // 移除单行注释
    .replace(/@[^(]*\([^)]*\)/g, '') // 移除简单装饰器
    .replace(/@[^(]*\({[\s\S]*?}\)/g, '') // 移除复杂装饰器
    .replace(/@\w+/g, ''); // 移除无参数装饰器
  
  // 改进的字段匹配：支持多行内联对象类型
  const fieldDefinitions = extractFieldDefinitions(cleanedBody);
  
  // 调试输出
  if (className.includes('TodoFilter')) {
    console.log(`[DEBUG] ${className} field definitions:`, fieldDefinitions);
  }
  
  for (const { fieldName, fieldType } of fieldDefinitions) {
    // 跳过方法定义和构造函数
    if (fieldType.includes('(') && fieldType.includes(')')) continue;
    if (fieldName === 'constructor') continue;
    
    // 清理字段类型
    const cleanFieldType = fieldType.replace(/\s*=.*$/, '').trim();
    
    // 跳过空类型
    if (!cleanFieldType) continue;
    
    // 检查字段是否可选
    const isOptional = cleanFieldType.includes('?') || 
                      cleanFieldType.includes('undefined') ||
                      cleanFieldType.includes('null');
    
    // 检查是否为数组
    const isArray = cleanFieldType.includes('[]');
    
    // 提取基础类型
    let baseType = cleanFieldType;
    
    // 对于内联对象类型，保持完整结构
    if (baseType.includes('{') && baseType.includes('}')) {
      // 移除数组标记但保持对象结构
      baseType = baseType.replace(/\[\]$/, '').trim();
    } else {
      // 对于普通类型，进行标准清理
      baseType = baseType
        .replace(/\?/g, '')
        .replace(/\[\]/g, '')
        .replace(/\s*\|\s*undefined/g, '')
        .replace(/\s*\|\s*null/g, '')
        .trim();
    }
    
    const field: DtoField = {
      name: fieldName,
      type: mapTsTypeToVoType(baseType),
      optional: isOptional,
      isArray: isArray,
      decorators: []
    };
    
    fields.push(field);
  }
  
  return fields;
}

// 提取字段定义，支持多行内联对象类型
function extractFieldDefinitions(classBody: string): Array<{fieldName: string, fieldType: string}> {
  const fields: Array<{fieldName: string, fieldType: string}> = [];
  const lines = classBody.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // 匹配字段定义开始：fieldName?: 或 fieldName:
    const fieldStartMatch = line.match(/^(\w+)([!?]?):\s*(.*)/);
    if (!fieldStartMatch) continue;
    
    const [, fieldName, optionalMarker, typeStart] = fieldStartMatch;
    let fieldType = typeStart;
    
    // 如果类型以 { 开始，需要收集多行内容直到匹配的 }[]
    if (typeStart.includes('{')) {
      let braceCount = (typeStart.match(/{/g) || []).length - (typeStart.match(/}/g) || []).length;
      
      // 收集多行内容直到大括号平衡
      if (braceCount > 0) {
        for (let j = i + 1; j < lines.length && braceCount > 0; j++) {
          const nextLine = lines[j].trim();
          fieldType += '\n  ' + nextLine; // 保持适当的缩进
          braceCount += (nextLine.match(/{/g) || []).length - (nextLine.match(/}/g) || []).length;
          i = j; // 更新外层循环索引
        }
      }
      
      // 格式化内联对象类型
      fieldType = fieldType
        .replace(/\n\s*/g, ' ') // 将多行合并为单行
        .replace(/\s*{\s*/g, '{ ')
        .replace(/\s*;\s*}/g, '; }') // 修复分号和右大括号之间的格式
        .replace(/\s*}\s*\[\]/g, ' }[]') // 修复右大括号和数组标记之间的格式
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // 清理字段类型，移除末尾的分号
    fieldType = fieldType.replace(/;$/, '').trim();
    
    // 保留可选标记信息
    const finalFieldName = optionalMarker === '?' ? fieldName + '?' : fieldName;
    
    
    fields.push({ fieldName: finalFieldName, fieldType });
  }
  
  return fields;
}

// 映射 TypeORM 列类型到 TypeScript 类型
function mapColumnTypeToTsType(columnType: string): string {
  const typeMap: Record<string, string> = {
    'varchar': 'string',
    'text': 'string',
    'int': 'number',
    'integer': 'number',
    'float': 'number',
    'double': 'number',
    'decimal': 'number',
    'boolean': 'boolean',
    'bool': 'boolean',
    'date': 'string',
    'datetime': 'string',
    'timestamp': 'string',
    'time': 'string',
    'json': 'any',
    'simple-array': 'string[]'
  };
  
  return typeMap[columnType] || 'string';
}

// 映射 TypeScript 类型到 VO 类型
function mapTsTypeToVoType(tsType: string): string {
  // 日期类型统一转为 string
  if (tsType === 'Date') return 'string';
  
  // 处理内联对象类型：{ id: string; source: TodoSource; }
  if (tsType.startsWith('{') && tsType.endsWith('}')) {
    // 清理内联对象类型的格式，确保正确的换行和缩进
    return tsType
      .replace(/\s*{\s*/g, '{ ')
      .replace(/\s*;\s*/g, '; ')
      .replace(/\s*}\s*/g, ' }')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  // 保持其他类型不变
  return tsType;
}

// 已移除硬编码的实体字段定义，改为动态解析

// 解析类字段
function parseClassFields(classBody: string): DtoField[] {
  const fields: DtoField[] = [];
  
  // 使用 extractFieldDefinitions 函数来处理多行内联对象类型
  const fieldDefinitions = extractFieldDefinitions(classBody);
  
  for (const { fieldName, fieldType } of fieldDefinitions) {
    // 跳过方法定义
    if (fieldType.includes('(') && fieldType.includes(')')) continue;
    if (fieldName === 'constructor') continue;
    
    // 清理字段类型
    const cleanFieldType = fieldType.replace(/\s*=.*$/, '').trim();
    
    // 跳过空类型
    if (!cleanFieldType) continue;
    
    // 解析字段属性
    const optional = fieldName.includes('?');
    const isArray = cleanFieldType.endsWith('[]');
    const baseType = isArray ? cleanFieldType.slice(0, -2) : cleanFieldType;
    
    fields.push({
      name: fieldName.replace('?', ''),
      type: baseType,
      optional,
      isArray,
      decorators: []
    });
  }
  
  return fields;
}

// 解析单个字段行
function parseFieldLine(line: string): DtoField | null {
  // 跳过装饰器行
  if (line.startsWith('@')) return null;
  
  // 跳过方法中的赋值语句（包含 this. 或其他赋值操作）
  if (line.includes('this.') || line.includes('=') || line.includes('...')) return null;
  
  // 匹配属性定义: name?: type;
  const fieldMatch = line.match(/^(\w+)(\?)?:\s*([^;,]+)[;,]?$/);
  if (!fieldMatch) return null;
  
  const [, name, optional, typeStr] = fieldMatch;
  
  // 解析类型
  let type = typeStr.trim();
  let isArray = false;
  
  if (type.endsWith('[]')) {
    isArray = true;
    type = type.slice(0, -2);
  }
  
  return {
    name,
    type,
    optional: !!optional,
    isArray,
    decorators: [], // 简化处理，不解析装饰器
  };
}

// 生成 VO 内容
export function generateVoFromDto(dtoClasses: DtoClass[], dtoFilePath: string): string {
  const lines: string[] = [];
  
  // 生成导入语句
  const imports = generateVoImports(dtoClasses, dtoFilePath);
  if (imports.length > 0) {
    lines.push(...imports, '');
  }
  
  // 为每个 DTO 类生成对应的 VO，避免重复
  const generatedVoNames = new Set<string>();
  
  for (const dtoClass of dtoClasses) {
    const baseName = dtoClass.name.replace('Dto', '').replace('Model', '').replace('Form', '').replace('Filter', '');
    let voName: string;
    
    if (dtoClass.type === 'model') {
      voName = `${baseName}ModelVo`;
    } else if (dtoClass.type === 'filter') {
      voName = `${baseName}FilterVo`;
    } else if (dtoClass.type === 'form') {
      voName = `${baseName}FormVo`;
    } else {
      voName = `${baseName}Vo`;
    }
    
    // 避免重复生成相同的 VO
    if (generatedVoNames.has(voName)) continue;
    generatedVoNames.add(voName);
    
    const voContent = generateSingleVo(dtoClass);
    lines.push(voContent, '');
  }
  
  // 生成额外的类型定义（如 ListVo, PageVo）
  const additionalTypes = generateAdditionalTypes(dtoClasses);
  if (additionalTypes.length > 0) {
    lines.push(...additionalTypes);
  }
  
  return lines.join('\n').trim() + '\n';
}

// 生成导入语句
function generateVoImports(dtoClasses: DtoClass[], dtoFilePath: string): string[] {
  const imports: string[] = [];
  
  // 添加基础 VO 导入
  const hasModelType = dtoClasses.some(dto => dto.type === 'model');
  const hasFilterType = dtoClasses.some(dto => dto.type === 'filter');
  const hasFormType = dtoClasses.some(dto => dto.type === 'form');
  
  const baseImports: string[] = [];
  if (hasModelType) baseImports.push('BaseModelVo');
  if (hasFilterType) baseImports.push('BaseFilterVo');
  if (hasFormType) baseImports.push('BaseFormVo');
  
  if (baseImports.length > 0) {
    imports.push(`import { ${baseImports.join(', ')} } from '../../common/model.vo';`);
  }
  
  // 检查是否需要枚举导入
  const enumTypes = new Set<string>();
  dtoClasses.forEach(dtoClass => {
    dtoClass.fields.forEach(field => {
      if (['GoalType', 'GoalStatus', 'Importance', 'Difficulty', 'TodoStatus', 'TodoSource', 'TaskStatus', 'TaskPriority', 'HabitFrequency'].includes(field.type)) {
        enumTypes.add(field.type);
      }
    });
  });
  
  if (enumTypes.size > 0) {
    const enumImports = Array.from(enumTypes).sort();
    imports.push(`import { ${enumImports.join(', ')} } from '@life-toolkit/enum';`);
  }
  
  // 检查是否需要其他 ModelVo 类型导入
  const referencedTypes = new Set<string>();
  dtoClasses.forEach(dtoClass => {
    dtoClass.fields.forEach(field => {
      const convertedType = convertDtoTypeToVo(field.type);
      if (convertedType.endsWith('ModelVo') && convertedType !== `${dtoClass.name.replace('Dto', '').replace('Model', '')}ModelVo`) {
        referencedTypes.add(convertedType);
      }
    });
  });
  
  // 添加引用类型的导入（这里简化处理，实际项目中可能需要更复杂的路径解析）
  referencedTypes.forEach(type => {
    const baseName = type.replace('ModelVo', '').toLowerCase();
    imports.push(`import { ${type} } from '../${baseName}/${baseName}-model.vo';`);
  });
  
  return imports;
}

// 生成单个 VO 类型定义
function generateSingleVo(dtoClass: DtoClass): string {
  const lines: string[] = [];
  
  // 生成 VO 类型名称 - 根据类型使用不同的后缀
  const baseName = dtoClass.name.replace('Dto', '').replace('Model', '').replace('Form', '').replace('Filter', '');
  let voName: string;
  let baseType: string;
  
  if (dtoClass.type === 'model') {
    voName = `${baseName}ModelVo`;
    baseType = 'BaseModelVo';
  } else if (dtoClass.type === 'filter') {
    voName = `${baseName}FilterVo`;
    baseType = 'BaseFilterVo';
  } else if (dtoClass.type === 'form') {
    voName = `${baseName}FormVo`;
    baseType = 'BaseFormVo';
  } else {
    voName = `${baseName}Vo`;
    baseType = 'BaseModelVo';
  }
  
  lines.push(`export type ${voName} = {`);
  
  // 生成字段定义
  for (const field of dtoClass.fields) {
    const voField = convertDtoFieldToVo(field);
    if (voField) {
      lines.push(`  ${voField}`);
    }
  }
  
  lines.push(`} & ${baseType};`);
  
  return lines.join('\n');
}

// 转换 DTO 字段为 VO 字段
function convertDtoFieldToVo(field: DtoField): string | null {
  // 跳过某些内部字段
  if (['importVo', 'appendToCreateEntity', 'appendToUpdateEntity', 'exportUpdateEntity', 'importEntity', 'exportWithoutRelationsVo', 'exportVo'].includes(field.name)) {
    return null;
  }
  
  let type = field.type;
  
  // 对于内联对象类型，直接使用原始类型（已包含数组标记）
  if (type.startsWith('{') && type.endsWith('}')) {
    // 内联对象类型保持原样，数组标记由 field.isArray 控制
    if (field.isArray && !type.endsWith('[]')) {
      type += '[]';
    }
  } else {
    // 对于普通类型，进行标准转换
    type = convertDtoTypeToVo(type);
    if (field.isArray && !type.endsWith('[]')) {
      type += '[]';
    }
  }
  
  const optional = field.optional ? '?' : '';
  return `${field.name}${optional}: ${type};`;
}

// 转换 DTO 类型为 VO 类型
function convertDtoTypeToVo(type: string): string {
  // 日期类型转换
  if (type === 'Date') return 'string';
  
  // 数组类型处理
  if (type.endsWith('[]')) {
    const baseType = type.slice(0, -2);
    return convertDtoTypeToVo(baseType) + '[]';
  }
  
  // DTO 类型转换
  if (type.endsWith('Dto')) {
    const baseName = type.replace('Dto', '');
    // 对于关联字段，使用 ModelVo 类型
    return `${baseName}ModelVo`;
  }
  
  // 枚举类型保持不变
  if (['GoalType', 'GoalStatus', 'Importance', 'Difficulty', 'TodoStatus', 'TodoSource', 'TaskStatus', 'TaskPriority', 'HabitFrequency'].includes(type)) {
    return type;
  }
  
  // 保持原类型
  return type;
}

// 生成额外的类型定义
function generateAdditionalTypes(dtoClasses: DtoClass[]): string[] {
  const lines: string[] = [];
  const generatedTypes = new Set<string>();
  
  // 为 model 类型生成 ListVo 和 PageVo，但避免重复
  const modelClasses = dtoClasses.filter(cls => cls.type === 'model');
  
  // 按类名去重，避免 GoalDto 和 GoalWithoutRelationsDto 都生成相同的类型
  const uniqueBaseNames = new Set<string>();
  
  for (const modelClass of modelClasses) {
    // 提取基础名称，移除 Dto 和 Model 后缀
    let baseName = modelClass.name.replace('Dto', '').replace('Model', '');
    
    // 如果已经处理过这个基础名称，跳过
    if (uniqueBaseNames.has(baseName)) continue;
    uniqueBaseNames.add(baseName);
    
    // 使用 ModelVo 作为标准命名
    const voName = `${baseName}ModelVo`;
    
    const listTypeName = `${baseName}ListVo`;
    const pageTypeName = `${baseName}PageVo`;
    
    if (!generatedTypes.has(listTypeName)) {
      generatedTypes.add(listTypeName);
      lines.push(`export type ${listTypeName} = {`);
      lines.push(`  list: ${voName}[];`);
      lines.push('};');
      lines.push('');
    }
    
    if (!generatedTypes.has(pageTypeName)) {
      generatedTypes.add(pageTypeName);
      lines.push(`export type ${pageTypeName} = {`);
      lines.push(`  list: ${voName}[];`);
      lines.push('  total: number;');
      lines.push('  pageNum: number;');
      lines.push('  pageSize: number;');
      lines.push('};');
      lines.push('');
    }
  }
  
  return lines;
}
