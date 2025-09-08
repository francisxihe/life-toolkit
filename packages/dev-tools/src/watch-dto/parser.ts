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
export function parseDtoClasses(content: string): DtoClass[] {
  const classes: DtoClass[] = [];
  
  // 提取导入语句
  const imports = extractImports(content);
  
  // 先尝试从实体中推断字段（针对使用 IntersectionType/OmitType 的情况）
  const entityFields = extractEntityFields(content);
  
  // 匹配所有导出的类，改进正则表达式以正确捕获类体
  const classRegex = /export\s+class\s+(\w+Dto)\s*(?:extends\s+([^{]+?))?\s*{([\s\S]*?)^}/gm;
  let match;
  
  while ((match = classRegex.exec(content)) !== null) {
    const [, className, extendsClause, classBody] = match;
    
    // 确定 DTO 类型
    let type: 'model' | 'form' | 'filter' = 'model';
    if (className.includes('Form')) type = 'form';
    else if (className.includes('Filter')) type = 'filter';
    
    // 解析字段
    let fields = parseClassFields(classBody);
    
    // 对于 model 类型，总是使用推断字段，因为大多数字段通过 IntersectionType 隐式定义
    if (type === 'model') {
      if (entityFields.length > 0) {
        // 合并显式字段和推断字段，显式字段优先
        const explicitFieldNames = new Set(fields.map(f => f.name));
        const additionalFields = entityFields.filter(f => !explicitFieldNames.has(f.name));
        fields = [...fields, ...additionalFields];
      }
      
      // 如果仍然没有足够的字段，说明解析有问题，使用完整的推断字段
      if (fields.length < 5 && entityFields.length > 0) {
        fields = entityFields;
      }
    }
    
    classes.push({
      name: className,
      type,
      fields,
      imports,
      extends: extendsClause?.trim(),
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

// 从实体导入中推断字段
function extractEntityFields(content: string): DtoField[] {
  const fields: DtoField[] = [];
  
  // 查找实体导入
  const entityImportMatch = content.match(/import\s+{\s*(\w+)\s+}\s+from\s+['"][^'"]*\.entity['"]/);
  if (!entityImportMatch) return fields;
  
  const entityName = entityImportMatch[1];
  
  // 根据实体名称推断常见字段
  const commonFields = getCommonFieldsByEntityName(entityName);
  return commonFields;
}

// 根据实体名称获取常见字段
function getCommonFieldsByEntityName(entityName: string): DtoField[] {
  const baseFields: DtoField[] = [
    { name: 'id', type: 'string', optional: false, isArray: false, decorators: [] },
    { name: 'createdAt', type: 'string', optional: true, isArray: false, decorators: [] },
    { name: 'updatedAt', type: 'string', optional: true, isArray: false, decorators: [] },
  ];
  
  if (entityName === 'Goal') {
    return [
      ...baseFields,
      { name: 'name', type: 'string', optional: false, isArray: false, decorators: [] },
      { name: 'description', type: 'string', optional: true, isArray: false, decorators: [] },
      { name: 'status', type: 'GoalStatus', optional: false, isArray: false, decorators: [] },
      { name: 'type', type: 'GoalType', optional: false, isArray: false, decorators: [] },
      { name: 'importance', type: 'number', optional: false, isArray: false, decorators: [] },
      { name: 'difficulty', type: 'number', optional: true, isArray: false, decorators: [] },
      { name: 'startAt', type: 'string', optional: true, isArray: false, decorators: [] },
      { name: 'endAt', type: 'string', optional: true, isArray: false, decorators: [] },
      { name: 'doneAt', type: 'string', optional: true, isArray: false, decorators: [] },
      { name: 'abandonedAt', type: 'string', optional: true, isArray: false, decorators: [] },
    ];
  }
  
  if (entityName === 'Task') {
    return [
      ...baseFields,
      { name: 'name', type: 'string', optional: false, isArray: false, decorators: [] },
      { name: 'description', type: 'string', optional: true, isArray: false, decorators: [] },
      { name: 'status', type: 'TaskStatus', optional: false, isArray: false, decorators: [] },
      { name: 'priority', type: 'TaskPriority', optional: true, isArray: false, decorators: [] },
      { name: 'dueAt', type: 'string', optional: true, isArray: false, decorators: [] },
      { name: 'completedAt', type: 'string', optional: true, isArray: false, decorators: [] },
    ];
  }
  
  if (entityName === 'Todo') {
    return [
      ...baseFields,
      { name: 'title', type: 'string', optional: false, isArray: false, decorators: [] },
      { name: 'content', type: 'string', optional: true, isArray: false, decorators: [] },
      { name: 'completed', type: 'boolean', optional: false, isArray: false, decorators: [] },
      { name: 'priority', type: 'TodoPriority', optional: true, isArray: false, decorators: [] },
      { name: 'dueAt', type: 'string', optional: true, isArray: false, decorators: [] },
    ];
  }
  
  if (entityName === 'Habit') {
    return [
      ...baseFields,
      { name: 'name', type: 'string', optional: false, isArray: false, decorators: [] },
      { name: 'description', type: 'string', optional: true, isArray: false, decorators: [] },
      { name: 'frequency', type: 'HabitFrequency', optional: false, isArray: false, decorators: [] },
      { name: 'target', type: 'number', optional: true, isArray: false, decorators: [] },
      { name: 'unit', type: 'string', optional: true, isArray: false, decorators: [] },
    ];
  }
  
  return baseFields;
}

// 解析类字段
function parseClassFields(classBody: string): DtoField[] {
  const fields: DtoField[] = [];
  
  // 移除方法定义和注释，只保留属性声明
  const lines = classBody.split('\n');
  let inComment = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // 跳过空行
    if (!trimmed) continue;
    
    // 处理多行注释
    if (trimmed.startsWith('/*')) {
      inComment = true;
      continue;
    }
    if (trimmed.endsWith('*/')) {
      inComment = false;
      continue;
    }
    if (inComment) continue;
    
    // 跳过单行注释
    if (trimmed.startsWith('//')) continue;
    
    // 跳过装饰器
    if (trimmed.startsWith('@')) continue;
    
    // 跳过方法定义（包含括号的行）
    if (trimmed.includes('(') && trimmed.includes(')')) continue;
    
    // 跳过代码块开始
    if (trimmed.includes('{') && !trimmed.includes(':')) continue;
    
    // 解析属性定义
    const field = parseFieldLine(trimmed);
    if (field) {
      fields.push(field);
    }
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
  const hasEnumFields = dtoClasses.some(dtoClass => 
    dtoClass.fields.some(field => 
      ['GoalType', 'GoalStatus', 'Importance', 'Difficulty'].includes(field.type)
    )
  );
  
  if (hasEnumFields) {
    imports.push("import { GoalType, GoalStatus, Importance, Difficulty } from '@life-toolkit/enum';");
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
  if (['importVo', 'appendToCreateEntity', 'appendToUpdateEntity', 'exportUpdateEntity'].includes(field.name)) {
    return null;
  }
  
  let type = convertDtoTypeToVo(field.type);
  
  if (field.isArray) {
    type += '[]';
  }
  
  const optional = field.optional ? '?' : '';
  return `${field.name}${optional}: ${type};`;
}

// 转换 DTO 类型为 VO 类型
function convertDtoTypeToVo(type: string): string {
  // 日期类型转换
  if (type === 'Date') return 'string';
  
  // DTO 类型转换
  if (type.endsWith('Dto')) {
    const baseName = type.replace('Dto', '');
    // 对于关联字段，使用 ModelVo 类型
    return `${baseName}ModelVo`;
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
