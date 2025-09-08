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
    } else if (
      className.toLowerCase().includes('form') ||
      className.toLowerCase().includes('create') ||
      className.toLowerCase().includes('update')
    ) {
      type = 'form';
    }

    // 解析类字段
    let fields: DtoField[] = [];

    if (type === 'form') {
      // Form 类型特殊处理：解析 PickType 和 IntersectionType
      fields = parseFormDtoFields(fullMatch, content, dtoFilePath);
    } else {
      // Model 和 Filter 类型正常处理
      fields = parseClassFields(fullMatch);

      // 动态解析实体字段（先添加实体字段，再添加类字段，这样类字段会覆盖实体字段）
      const entityFields = extractEntityFields(content, dtoFilePath);
      fields = [...entityFields, ...fields];
    }

    // 字段去重处理
    const deduplicatedFields = deduplicateFields(fields);

    classes.push({
      name: className,
      type,
      fields: deduplicatedFields,
      imports: [],
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
function extractEntityReferences(content: string): Array<{ className: string; filePath: string }> {
  const refs: Array<{ className: string; filePath: string }> = [];

  // 查找实体导入
  const entityImportMatches = content.matchAll(/import\s+{\s*([^}]+)\s+}\s+from\s+['"]([^'"]*\.entity)['"]/g);

  for (const match of entityImportMatches) {
    const imports = match[1].split(',').map((s) => s.trim());
    const importPath = match[2];

    imports.forEach((imp) => {
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
  } catch (error: any) {
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
    const isOptional =
      cleanFieldType.includes('?') || cleanFieldType.includes('undefined') || cleanFieldType.includes('null');

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
      decorators: [],
    };

    fields.push(field);
  }

  return fields;
}

// 提取字段定义，支持多行内联对象类型
function extractFieldDefinitions(classBody: string): Array<{ fieldName: string; fieldType: string }> {
  const fields: Array<{ fieldName: string; fieldType: string }> = [];
  const lines = classBody.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // 跳过注释、装饰器、方法定义等
    if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('@') || line.startsWith('*')) continue;

    // 跳过方法定义（包含括号的行，但排除类型定义中的函数类型）
    if (line.includes('(') && line.includes(')')) {
      // 如果是方法定义（不是字段的函数类型），跳过
      if (!line.includes(':') || line.match(/^\s*\w+\s*\(/)) continue;
    }

    // 跳过访问修饰符和静态方法
    if (
      line.startsWith('static ') ||
      line.startsWith('private ') ||
      line.startsWith('public ') ||
      line.startsWith('protected ')
    )
      continue;

    // 跳过构造函数
    if (line.includes('constructor')) continue;

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

    // 清理字段类型，移除末尾的分号和逗号
    fieldType = fieldType.replace(/[;,]$/, '').trim();

    // 跳过包含无效字符的字段类型
    if (fieldType.includes('this.') || fieldType.includes(',;')) continue;

    // 保留可选标记信息
    const finalFieldName = optionalMarker === '?' ? fieldName + '?' : fieldName;

    fields.push({ fieldName: finalFieldName, fieldType });
  }

  return fields;
}

// 映射 TypeORM 列类型到 TypeScript 类型
function mapColumnTypeToTsType(columnType: string): string {
  const typeMap: Record<string, string> = {
    varchar: 'string',
    text: 'string',
    int: 'number',
    integer: 'number',
    float: 'number',
    double: 'number',
    decimal: 'number',
    boolean: 'boolean',
    bool: 'boolean',
    date: 'string',
    datetime: 'string',
    timestamp: 'string',
    time: 'string',
    json: 'any',
    'simple-array': 'string[]',
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
    // 跳过方法定义、构造函数、静态方法
    if (fieldType.includes('(') && fieldType.includes(')')) continue;
    if (fieldName === 'constructor') continue;
    if (fieldName.includes('static ')) continue;
    if (fieldName.includes('this.')) continue;

    // 清理字段类型
    const cleanFieldType = fieldType.replace(/\s*=.*$/, '').trim();

    // 跳过空类型或无效类型
    if (!cleanFieldType || cleanFieldType.includes(',')) continue;

    // 解析字段属性
    const optional = fieldName.includes('?');
    const isArray = cleanFieldType.endsWith('[]');
    const baseType = isArray ? cleanFieldType.slice(0, -2) : cleanFieldType;

    fields.push({
      name: fieldName.replace('?', ''),
      type: baseType,
      optional,
      isArray,
      decorators: [],
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
export function generateVoContent(dtoClasses: DtoClass[], dtoFilePath: string): string {
  const lines: string[] = [];

  // 生成导入语句
  const imports = generateVoImports(dtoClasses, dtoFilePath);
  lines.push(...imports, '');

  // 分离 WithoutRelations 和主要 DTO 类
  const withoutRelationsClasses = dtoClasses.filter(
    (dto) => dto.name.includes('WithoutRelations') && dto.type === 'model'
  );
  const mainClasses = dtoClasses.filter((dto) => !dto.name.includes('WithoutRelations') && dto.type === 'model');
  const otherClasses = dtoClasses.filter((dto) => dto.type !== 'model');

  const generatedVoNames = new Set<string>();

  // 1. 先生成 WithoutRelationsVo 类型
  for (const dtoClass of withoutRelationsClasses) {
    const baseName = dtoClass.name.replace('Dto', '').replace('Model', '').replace('WithoutRelations', '');
    const voName = `${baseName}WithoutRelationsVo`;

    if (!generatedVoNames.has(voName)) {
      generatedVoNames.add(voName);
      // 强制设置为 WithoutRelations 类型，确保生成正确的类型名
      const tempClass = { ...dtoClass, name: dtoClass.name, type: 'model' as const };
      const voContent = generateSingleVo(tempClass);
      lines.push(voContent, '');
    }
  }

  // 2. 生成主要的 VO 类型（WithoutRelationsVo + 关系字段的并集）
  for (const mainClass of mainClasses) {
    const baseName = mainClass.name.replace('Dto', '').replace('Model', '');
    const voName = `${baseName}Vo`;
    const withoutRelationsVoName = `${baseName}WithoutRelationsVo`;

    if (!generatedVoNames.has(voName)) {
      generatedVoNames.add(voName);

      // 检查是否存在对应的 WithoutRelationsVo
      const hasWithoutRelations = withoutRelationsClasses.some(
        (cls) => cls.name.replace('Dto', '').replace('Model', '').replace('WithoutRelations', '') === baseName
      );

      if (hasWithoutRelations) {
        // 提取关系字段（只包含关联类型的字段）
        const relationFields = mainClass.fields.filter((field) => {
          const isEntityRelation =
            // 实体类型
            ['Task', 'Todo', 'Goal', 'Habit', 'TrackTime', 'User'].some(
              (entity) => field.type === entity || field.type === `${entity}[]`
            ) ||
            // DTO 类型
            field.type.endsWith('Dto') ||
            field.type.endsWith('Dto[]') ||
            // VO 类型
            field.type.endsWith('Vo') ||
            field.type.endsWith('Vo[]') ||
            // 内联对象类型
            (field.type.includes('{') && field.type.includes('}')) ||
            // 复杂关系类型
            ['TodoRepeat', 'TaskRepeat', 'GoalRepeat', 'HabitRepeat'].includes(field.type) ||
            // any 类型
            field.type === 'any';
          return isEntityRelation;
        });

        if (relationFields.length > 0) {
          lines.push(`export type ${voName} = ${withoutRelationsVoName} & {`);

          // 去重关系字段，优先保留 VO 类型而不是实体类型
          const uniqueRelationFields = new Map<string, DtoField>();
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

          lines.push('};', '');
        } else {
          // 如果没有关系字段，直接使用 WithoutRelationsVo
          lines.push(`export type ${voName} = ${withoutRelationsVoName};`, '');
        }
      } else {
        // 如果没有 WithoutRelationsVo，直接生成完整的 VO
        const voContent = generateSingleVo(mainClass);
        lines.push(voContent, '');
      }
    }
  }

  // 3. 处理其他类型（Form、Filter 等）
  for (const dtoClass of otherClasses) {
    if (dtoClass.type === 'form') {
      // Form 类型特殊处理：根据类名生成对应的 VO
      if (dtoClass.name.startsWith('Create')) {
        const baseName = dtoClass.name.replace('CreateTodoDto', 'Todo').replace('Dto', '');
        const voName = `Create${baseName}FormVo`;

        if (!generatedVoNames.has(voName)) {
          generatedVoNames.add(voName);
          const voContent = generateFormVo(dtoClass, 'Create');
          lines.push(voContent, '');
        }
      } else if (dtoClass.name.startsWith('Update')) {
        const baseName = dtoClass.name.replace('UpdateTodoDto', 'Todo').replace('Dto', '');
        const voName = `Update${baseName}FormVo`;

        if (!generatedVoNames.has(voName)) {
          generatedVoNames.add(voName);
          const voContent = generateFormVo(dtoClass, 'Update');
          lines.push(voContent, '');
        }
      }
    } else {
      // Filter 等其他类型
      const baseName = dtoClass.name.replace('Dto', '').replace('Filter', '');
      
      if (dtoClass.name.includes('Page')) {
        // PageFilter 类型特殊处理，添加 pageNum 和 pageSize 字段
        const voName = `${baseName}FilterVo`;
        
        if (!generatedVoNames.has(voName)) {
          generatedVoNames.add(voName);
          const voContent = generatePageFilterVo(dtoClass);
          lines.push(voContent, '');
        }
      } else {
        const voName = `${baseName}FilterVo`;
        
        if (!generatedVoNames.has(voName)) {
          generatedVoNames.add(voName);
          const voContent = generateSingleVo(dtoClass);
          lines.push(voContent, '');
        }
      }
    }
  }

  return lines.join('\n').trim() + '\n';
}

// 字段去重函数（优先保留类中直接定义的字段）
function deduplicateFields(fields: DtoField[]): DtoField[] {
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
      }
    }
  }

  return Array.from(fieldMap.values());
}

// 计算类型复杂度，用于字段去重时的优先级判断
function getTypeComplexity(type: string): number {
  // 关联类型（以Dto结尾）优先级最高
  if (type.endsWith('Dto') || type.endsWith('Dto[]')) return 10;
  // 实体类型（Task, Todo, Goal等）优先级最低
  if (type === 'Task' || type === 'Todo' || type === 'Goal' || type === 'Habit' || type === 'TrackTime') return 1;
  // 枚举类型优先级中等
  if (type.match(/^[A-Z][a-zA-Z]*$/)) return 5;
  // 基础类型优先级中等
  return 3;
}

// 生成导入语句
function generateVoImports(dtoClasses: DtoClass[], dtoFilePath: string): string[] {
  const imports: string[] = [];

  // 添加基础 VO 导入
  const hasModelType = dtoClasses.some((dto) => dto.type === 'model');
  const hasFilterType = dtoClasses.some((dto) => dto.type === 'filter');
  const hasFormType = dtoClasses.some((dto) => dto.type === 'form');

  const baseImports: string[] = [];
  if (hasModelType) baseImports.push('BaseEntityVo');
  if (hasFilterType) baseImports.push('BaseFilterVo');
  if (hasFormType) baseImports.push('BaseFormVo');

  if (baseImports.length > 0) {
    imports.push(`import { ${baseImports.join(', ')} } from '../../common';`);
  }

  // 检查是否需要枚举导入
  const enumTypes = new Set<string>();
  dtoClasses.forEach((dtoClass) => {
    dtoClass.fields.forEach((field) => {
      if (
        [
          'GoalType',
          'GoalStatus',
          'Importance',
          'Difficulty',
          'TodoStatus',
          'TodoSource',
          'TaskStatus',
          'TaskPriority',
          'HabitFrequency',
        ].includes(field.type)
      ) {
        enumTypes.add(field.type);
      }
    });
  });

  if (enumTypes.size > 0) {
    const enumImports = Array.from(enumTypes).sort();
    imports.push(`import { ${enumImports.join(', ')} } from '@life-toolkit/enum';`);
  }

  // 完全不生成任何其他导入

  return imports;
}

// 生成单个 VO 类型定义
function generateSingleVo(dtoClass: DtoClass): string {
  const lines: string[] = [];

  // 生成 VO 类型名称 - 根据类型使用不同的后缀
  const baseName = dtoClass.name
    .replace('Dto', '')
    .replace('Model', '')
    .replace('Form', '')
    .replace('Filter', '')
    .replace('WithoutRelations', '');
  let voName: string;
  let baseType: string;

  if (dtoClass.type === 'model') {
    // 对于 WithoutRelations 类型，保持原名；对于主要类型，直接使用 Vo 后缀
    if (dtoClass.name.includes('WithoutRelations')) {
      voName = `${baseName}WithoutRelationsVo`;
    } else {
      voName = `${baseName}Vo`;
    }
    baseType = 'BaseEntityVo';
  } else if (dtoClass.type === 'filter') {
    voName = `${baseName}FilterVo`;
    baseType = 'BaseFilterVo';
  } else if (dtoClass.type === 'form') {
    voName = `${baseName}FormVo`;
    baseType = 'BaseFormVo';
  } else {
    voName = `${baseName}Vo`;
    baseType = 'BaseEntityVo';
  }

  lines.push(`export type ${voName} = {`);

  // 先去重字段，再生成定义
  const uniqueFields = deduplicateFields(dtoClass.fields);

  for (const field of uniqueFields) {
    // 对于 WithoutRelations 类型，过滤掉所有关系字段
    if (voName.includes('WithoutRelations')) {
      const isRelationField =
        // 实体类型
        ['Task', 'Todo', 'Goal', 'Habit', 'TrackTime', 'User'].some(
          (entity) => field.type === entity || field.type === `${entity}[]`
        ) ||
        // DTO 类型
        field.type.endsWith('Dto') ||
        field.type.endsWith('Dto[]') ||
        // VO 类型
        field.type.endsWith('Vo') ||
        field.type.endsWith('Vo[]') ||
        // 内联对象类型（如 TodoRepeat）
        (field.type.includes('{') && field.type.includes('}')) ||
        // 任何包含实体名的复杂类型
        ['TodoRepeat', 'TaskRepeat', 'GoalRepeat', 'HabitRepeat'].includes(field.type) ||
        // any 类型（通常是关系字段的占位符）
        field.type === 'any';
      if (isRelationField) continue;
    }

    const voField = convertDtoFieldToVo(field);
    if (voField) {
      lines.push(`  ${voField}`);
    }
  }

  lines.push(`} & ${baseType};`);

  // 不在这里生成别名，统一在外层处理

  return lines.join('\n');
}

// 转换 DTO 字段为 VO 字段
function convertDtoFieldToVo(field: DtoField): string | null {
  // 跳过某些内部字段和方法
  if (
    [
      'importVo',
      'appendToCreateEntity',
      'appendToUpdateEntity',
      'exportUpdateEntity',
      'importEntity',
      'exportWithoutRelationsVo',
      'exportVo',
      'importCreateVo',
      'importUpdateVo',
      'exportCreateEntity',
      'exportUpdateEntity',
      'dtoListToListVo',
      'dtoListToPageVo',
    ].includes(field.name)
  ) {
    return null;
  }

  // 跳过包含 this. 或其他无效语法的字段
  if (field.name.includes('this.') || field.type.includes('this.')) {
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

// 转换 DTO 类型到 VO 类型
function convertDtoTypeToVo(dtoType: string): string {
  // 移除数组标记进行类型转换
  const isArray = dtoType.endsWith('[]');
  const baseType = isArray ? dtoType.slice(0, -2) : dtoType;

  let voType: string;

  // 处理 DTO 类型转换
  if (baseType.endsWith('Dto')) {
    // 直接转换为 Vo，不添加 Model 后缀
    voType = baseType.replace('Dto', 'Vo');
  } else if (baseType.includes('Entity')) {
    // 实体类型转换为 Vo
    voType = baseType.replace('Entity', 'Vo');
  } else {
    // 其他类型保持不变
    voType = mapTsTypeToVoType(baseType);
  }

  // 恢复数组标记
  return isArray ? `${voType}[]` : voType;
}

// 解析 Form DTO 字段（处理 PickType 和 IntersectionType）
function parseFormDtoFields(classBody: string, content: string, dtoFilePath?: string): DtoField[] {
  const fields: DtoField[] = [];

  // 检查是否使用了 PickType
  const pickTypeMatch = classBody.match(/extends\s+PickType\(([^,]+),\s*\[([^\]]+)\]/);
  if (pickTypeMatch) {
    const [, sourceClass, fieldsStr] = pickTypeMatch;
    const fieldNames = fieldsStr.split(',').map((f) =>
      f
        .trim()
        .replace(/["']/g, '')
        .replace(/as const/, '')
        .trim()
    );

    // 从实体或其他 DTO 中获取这些字段的定义
    const sourceFields = getFieldsFromSource(sourceClass.trim(), content, dtoFilePath);

    for (const fieldName of fieldNames) {
      const sourceField = sourceFields.find((f) => f.name === fieldName);
      if (sourceField) {
        // 对于 Form DTO，直接使用源字段
        fields.push(sourceField);
      }
    }
  }

  // 检查是否使用了 IntersectionType（处理多行复杂类型）
  const intersectionMatch = classBody.match(/extends\s+IntersectionType\(([\s\S]*?)\)\s*{/);
  if (intersectionMatch) {
    const [, typesStr] = intersectionMatch;
    // 更精确地解析多行类型定义
    const cleanTypesStr = typesStr.replace(/\s+/g, ' ').trim();

    // 解析 PartialType
    const partialMatch = cleanTypesStr.match(/PartialType\(([^)]+)\)/);
    if (partialMatch) {
      const [, sourceType] = partialMatch;
      const sourceFields = getFieldsFromSource(sourceType.trim(), content, dtoFilePath);
      // PartialType 使所有字段变为可选
      sourceFields.forEach((field) => {
        fields.push({ ...field, optional: true });
      });
    }

    // 解析所有 PickType
    const pickTypeMatches = cleanTypesStr.matchAll(/PickType\(([^,]+),\s*\[([^\]]+)\]/g);
    for (const pickMatch of pickTypeMatches) {
      const [, sourceClass, fieldsStr] = pickMatch;
      const fieldNames = fieldsStr.split(',').map((f) =>
        f
          .trim()
          .replace(/["']/g, '')
          .replace(/as const/, '')
          .trim()
      );
      const sourceFields = getFieldsFromSource(sourceClass.trim(), content, dtoFilePath);

      for (const fieldName of fieldNames) {
        const sourceField = sourceFields.find((f) => f.name === fieldName);
        if (sourceField) {
          fields.push(sourceField);
        }
      }
    }
  }

  // 解析类中直接定义的字段
  const directFields = parseClassFields(classBody);
  fields.push(...directFields);

  return fields;
}

// 从源类中获取字段定义
function getFieldsFromSource(sourceClass: string, content: string, dtoFilePath?: string): DtoField[] {
  // 直接从实体文件中解析，避免递归调用
  const entityFields = extractEntityFields(content, dtoFilePath);
  return entityFields;
}

// 生成 Form VO（Create 和 Update 两种类型）
function generateFormVo(dtoClass: DtoClass, prefix: 'Create' | 'Update'): string {
  const lines: string[] = [];

  let baseName = dtoClass.name.replace('Dto', '');
  if (baseName.startsWith('Create')) {
    baseName = baseName.replace('Create', '');
  } else if (baseName.startsWith('Update')) {
    baseName = baseName.replace('Update', '');
  }

  const voName = `${prefix}${baseName}Vo`;
  const withoutRelationsVoName = `${baseName}WithoutRelationsVo`;

  // 生成 Pick 类型定义
  lines.push(`export type ${voName} = Pick<`);
  lines.push(`  ${withoutRelationsVoName},`);
  
  // 提取 PickType 中的字段名
  const pickFields = extractPickTypeFieldNames(dtoClass);
  if (pickFields.length > 0) {
    const fieldList = pickFields.map((f: string) => `'${f}'`).join(' | ');
    lines.push(`  ${fieldList}`);
  } else {
    // 如果没有 PickType 字段，使用所有非关系字段
    const nonRelationFields = dtoClass.fields.filter(field => 
      !checkIsRelationField(field) && 
      !['importVo', 'importCreateVo', 'importUpdateVo', 'importEntity', 'importUpdateEntity', 'exportCreateEntity', 'exportUpdateEntity'].includes(field.name) &&
      // 排除额外字段，只保留 WithoutRelationsVo 中存在的字段
      !['goalIds', 'taskId', 'parentId', 'repeatId', 'habitId'].includes(field.name)
    );
    const fieldList = nonRelationFields.map(f => `'${f.name}'`).join(' | ');
    if (fieldList) {
      lines.push(`  ${fieldList}`);
    } else {
      lines.push(`  never`);
    }
  }
  
  lines.push(`> & {`);
  
  // 添加额外的字段（如 goalIds, taskId 等）- 只包含非 WithoutRelationsVo 中的字段
  const extraFields = dtoClass.fields.filter(field => 
    !pickFields.includes(field.name) && 
    !checkIsRelationField(field) &&
    !['importVo', 'importCreateVo', 'importUpdateVo', 'importEntity', 'importUpdateEntity', 'exportCreateEntity', 'exportUpdateEntity'].includes(field.name) &&
    // 排除 WithoutRelationsVo 中已有的字段
    !['name', 'description', 'status', 'importance', 'urgency', 'tags', 'difficulty', 'startAt', 'endAt', 'planDate', 'planStartAt', 'planEndAt', 'estimateTime', 'goalId', 'parentId', 'taskId', 'repeatId', 'habitId', 'currentStreak', 'longestStreak', 'completedCount', 'targetDate', 'doneAt', 'abandonedAt', 'source'].includes(field.name)
  );
  
  for (const field of extraFields) {
    const voField = convertDtoFieldToVo(field);
    if (voField) {
      lines.push(`  ${voField}`);
    }
  }
  
  lines.push(`};`);

  return lines.join('\n');
}

// 提取 PickType 中的字段名
function extractPickTypeFieldNames(dtoClass: DtoClass): string[] {
  // 从已解析的字段中提取来自 PickType 的字段
  const pickFields: string[] = [];
  
  // 需要映射实体字段名到 VO 字段名
  const entityToVoFieldMap: Record<string, string> = {
    'startDate': 'startAt',
    'targetDate': 'endAt'
  };
  
  // 从 DTO 字段中提取基础字段，排除额外字段和关系字段
  for (const field of dtoClass.fields) {
    // 跳过方法字段
    if (['importVo', 'importCreateVo', 'importUpdateVo', 'importEntity', 'importUpdateEntity', 'exportCreateEntity', 'exportUpdateEntity'].includes(field.name)) {
      continue;
    }
    
    // 跳过关系字段
    if (checkIsRelationField(field)) {
      continue;
    }
    
    // 跳过额外字段（不在 WithoutRelationsVo 中的字段）
    if (['goalIds', 'taskId', 'parentId', 'repeatId', 'habitId'].includes(field.name)) {
      continue;
    }
    
    // 映射字段名
    const voFieldName = entityToVoFieldMap[field.name] || field.name;
    
    // 只添加在 WithoutRelationsVo 中存在的字段
    const validVoFields = ['name', 'description', 'status', 'importance', 'urgency', 'tags', 'difficulty', 'startAt', 'endAt', 'planDate', 'planStartAt', 'planEndAt', 'estimateTime', 'goalId', 'currentStreak', 'longestStreak', 'completedCount'];
    if (validVoFields.includes(voFieldName)) {
      pickFields.push(voFieldName);
    }
  }
  
  return pickFields;
}

// 检查是否为关系字段
function checkIsRelationField(field: DtoField): boolean {
  return (
    // 实体类型
    ['Task', 'Todo', 'Goal', 'Habit', 'TrackTime', 'User'].some(
      (entity) => field.type === entity || field.type === `${entity}[]`
    ) ||
    // DTO 类型
    field.type.endsWith('Dto') ||
    field.type.endsWith('Dto[]') ||
    // VO 类型
    field.type.endsWith('Vo') ||
    field.type.endsWith('Vo[]') ||
    // 内联对象类型
    (field.type.includes('{') && field.type.includes('}')) ||
    // 复杂关系类型
    ['TodoRepeat', 'TaskRepeat', 'GoalRepeat', 'HabitRepeat'].includes(field.type) ||
    // any 类型
    field.type === 'any'
  );
}

// 生成 PageFilter VO（包含 pageNum 和 pageSize 字段）
function generatePageFilterVo(dtoClass: DtoClass): string {
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
