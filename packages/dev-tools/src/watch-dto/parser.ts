export interface DtoClass {
  name: string;
  type: 'model' | 'filter' | 'form';
  fields: DtoField[];
  imports: string[];
  classDefinition?: string; // 保存原始类定义
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

    // 确定类型
    let type: 'model' | 'filter' | 'form' = 'model';
    if (className.includes('Filter') || className.includes('Page') || className.includes('Search')) {
      type = 'filter';
    } else if (className.includes('Create') || className.includes('Update') || className.includes('Form')) {
      type = 'form';
    }

    // 解析类字段
    let fields: DtoField[] = [];

    // 解析类体中直接定义的字段
    const directFields = parseClassFields(fullMatch);

    // 保存原始类定义用于后续的继承信息解析
    const classDefinition = fullMatch;

    // 合并字段（现在不解析继承字段，只保留直接定义的字段）
    fields = directFields;

    // 字段去重处理
    const deduplicatedFields = deduplicateFields(fields);

    classes.push({
      name: className,
      type,
      fields: deduplicatedFields,
      imports: [],
      classDefinition: fullMatch,
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
          const voContent = generateFilterVo(dtoClass);
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

// 解析继承信息，但不展开字段，而是保存继承结构
function parseInheritanceInfo(classBody: string): { type: 'simple' | 'pick' | 'intersection'; info: any } {
  // 检查 PickType
  const pickTypeMatch = classBody.match(/extends\s+PickType\(([^,]+),\s*\[([^\]]+)\]/);
  if (pickTypeMatch) {
    const [, sourceClass, fieldsStr] = pickTypeMatch;
    const fieldNames = fieldsStr
      .split(',')
      .map((f) =>
        f
          .trim()
          .replace(/[\"']/g, '')
          .replace(/as const/, '')
          .trim()
      )
      .filter((f) => f.length > 0);
    return {
      type: 'pick',
      info: { sourceClass: sourceClass.trim(), fields: fieldNames },
    };
  }

  // 检查 IntersectionType
  const intersectionMatch = classBody.match(/extends\s+IntersectionType\(([\s\S]*?)\)\s*{/);
  if (intersectionMatch) {
    const [, typesStr] = intersectionMatch;
    const cleanTypesStr = typesStr.replace(/\s+/g, ' ').trim();
    const types = parseIntersectionTypes(cleanTypesStr);
    return {
      type: 'intersection',
      info: { types },
    };
  }

  return { type: 'simple', info: {} };
}

// 不再解析继承字段，直接返回空数组
function parseInheritedFields(classBody: string, content: string, dtoFilePath?: string): DtoField[] {
  return [];
}

// 解析 IntersectionType 中的类型列表
function parseIntersectionTypes(typesStr: string): string[] {
  const types: string[] = [];
  let depth = 0;
  let current = '';
  let i = 0;

  while (i < typesStr.length) {
    const char = typesStr[i];

    if (char === '(') {
      depth++;
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      // 遇到顶级逗号，分割类型
      if (current.trim()) {
        types.push(current.trim());
      }
      current = '';
    } else {
      current += char;
    }

    i++;
  }

  // 添加最后一个类型
  if (current.trim()) {
    types.push(current.trim());
  }

  return types;
}

// 从源类中获取字段定义 - 简化版本，不做跨文件查找
function getFieldsFromSource(sourceClass: string, content: string, dtoFilePath?: string): DtoField[] {
  // 只从当前文件中查找类定义
  const classMatch = content.match(
    new RegExp(`export class ${sourceClass}[\\s\\S]*?\\{([\\s\\S]*?)(?=\\n\\s*export|\\n\\s*$|$)`)
  );
  if (classMatch) {
    const classBody = classMatch[1];
    return parseClassFields(classBody);
  }

  return [];
}

// 生成 Form VO - 基于继承信息生成类型组合
function generateFormVo(dtoClass: DtoClass, prefix: 'Create' | 'Update'): string {
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
      const customFields = dtoClass.fields.filter(
        (field) => !checkIsRelationField(field) && !isImportMethod(field.name)
      );

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
      for (const field of dtoClass.fields) {
        if (!checkIsRelationField(field) && !isImportMethod(field.name)) {
          const voField = convertDtoFieldToVo(field);
          if (voField) {
            lines.push(`  ${voField}`);
          }
        }
      }
      lines.push('};');
    }
  }

  return lines.join('\n');
}

// 生成 Filter VO - 基于继承信息生成类型组合
function generateFilterVo(dtoClass: DtoClass): string {
  const lines: string[] = [];

  const baseName = dtoClass.name.replace('FilterDto', '').replace('Dto', '');
  const filterVoName = `${baseName}FilterVo`;

  const inheritanceInfo = parseInheritanceInfo(dtoClass.classDefinition || '');

  if (inheritanceInfo.type === 'intersection') {
    // IntersectionType: 直接用 & 组合 VO 类型
    const voTypes = inheritanceInfo.info.types.map((type: string) => {
      if (type.includes('PartialType') && type.includes('PickType')) {
        // PartialType(PickType(SourceDto, [...]))
        const match = type.match(/PartialType\s*\(\s*PickType\(([^,]+),\s*\[([^\]]+)\]/);
        if (match) {
          const [, sourceClass, fieldsStr] = match;
          const sourceVoName = sourceClass.trim().replace('Dto', 'WithoutRelationsVo');
          const fieldList = fieldsStr
            .split(',')
            .map(
              (f: string) =>
                `'${f
                  .trim()
                  .replace(/[\"']/g, '')
                  .replace(/as const/, '')
                  .trim()}'`
            )
            .filter((f) => f !== "''")
            .join(' | ');
          return `Partial<Pick<${sourceVoName}, ${fieldList}>>`;
        }
      } else if (type.includes('PickType')) {
        // PickType(SourceDto, [...])
        const match = type.match(/PickType\(([^,]+),\s*\[([^\]]+)\]/);
        if (match) {
          const [, sourceClass, fieldsStr] = match;
          const sourceVoName = sourceClass.trim().replace('Dto', 'WithoutRelationsVo');
          const fieldList = fieldsStr
            .split(',')
            .map(
              (f: string) =>
                `'${f
                  .trim()
                  .replace(/[\"']/g, '')
                  .replace(/as const/, '')
                  .trim()}'`
            )
            .filter((f) => f !== "''")
            .join(' | ');
          return `Pick<${sourceVoName}, ${fieldList}>`;
        }
      }
      // 简单类型直接转换
      if (type.includes('BaseFilterDto')) {
        return 'BaseFilterVo';
      }
      return type.replace('Dto', 'Vo');
    });

    // 添加直接定义的字段
    const customFields = dtoClass.fields.filter((field) => !checkIsRelationField(field) && !isImportMethod(field.name));

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
    for (const field of dtoClass.fields) {
      if (!checkIsRelationField(field) && !isImportMethod(field.name)) {
        const voField = convertDtoFieldToVo(field);
        if (voField) {
          lines.push(`  ${voField}`);
        }
      }
    }
    lines.push(`};`);
  }

  return lines.join('\n');
}

// 分析类的继承结构
function analyzeInheritance(dtoClass: DtoClass): { isIntersectionType: boolean; types: string[] } {
  // 这里需要从原始类定义中分析继承结构
  // 暂时返回默认值，实际需要在解析时保存继承信息
  return { isIntersectionType: false, types: [] };
}

// 将 DTO 类型转换为对应的 VO 类型
function convertDtoTypeToVoType(dtoType: string): string {
  return dtoType.replace('Dto', 'Vo');
}

// 检查是否为导入方法
function isImportMethod(fieldName: string): boolean {
  return [
    'importVo',
    'importCreateVo',
    'importUpdateVo',
    'importEntity',
    'importUpdateEntity',
    'exportCreateEntity',
    'exportUpdateEntity',
    'appendToCreateEntity',
    'appendToUpdateEntity',
  ].includes(fieldName);
}

// 提取 PickType 中的字段名 - 从 DTO 类的原始定义中解析
function extractPickTypeFieldNames(dtoClass: DtoClass): string[] {
  // 需要映射实体字段名到 VO 字段名
  const entityToVoFieldMap: Record<string, string> = {
    startDate: 'startAt',
    targetDate: 'endAt',
  };

  // 直接从 DTO 类名推断应该包含的字段
  // 根据实际的 WithoutRelationsVo 定义来映射字段
  const moduleFieldMap: Record<string, string[]> = {
    CreateGoalDto: ['name', 'type', 'startAt', 'endAt', 'description', 'importance', 'difficulty', 'status'],
    UpdateGoalDto: ['name', 'type', 'startAt', 'endAt', 'description', 'importance', 'difficulty', 'status'],
    CreateHabitDto: ['name', 'description', 'importance', 'tags', 'difficulty'],
    UpdateHabitDto: ['name', 'description', 'importance', 'tags', 'difficulty'],
    CreateTaskDto: [
      'name',
      'description',
      'tags',
      'estimateTime',
      'importance',
      'urgency',
      'goalId',
      'startAt',
      'endAt',
    ],
    UpdateTaskDto: [
      'name',
      'description',
      'tags',
      'estimateTime',
      'importance',
      'urgency',
      'goalId',
      'startAt',
      'endAt',
    ],
    CreateTodoDto: [
      'name',
      'description',
      'status',
      'planDate',
      'planStartAt',
      'planEndAt',
      'importance',
      'urgency',
      'tags',
    ],
    UpdateTodoDto: [
      'name',
      'description',
      'status',
      'planDate',
      'planStartAt',
      'planEndAt',
      'importance',
      'urgency',
      'tags',
    ],
  };

  const pickFields = moduleFieldMap[dtoClass.name] || [];

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
