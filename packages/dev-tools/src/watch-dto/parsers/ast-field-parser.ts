import {
  Project,
  SourceFile,
  ClassDeclaration,
  PropertyDeclaration,
  SyntaxKind,
  ScriptTarget,
  ModuleKind,
  Decorator,
} from 'ts-morph';

export interface DtoField {
  name: string;
  type: string;
  optional: boolean;
  isArray: boolean;
  decorators: string[];
}

export class DtoASTParser {
  private project: Project;

  constructor() {
    this.project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: ScriptTarget.ES2020,
        module: ModuleKind.CommonJS,
        strict: false,
        skipLibCheck: true,
      },
    });
  }

  /**
   * 解析TypeScript文件内容，返回AST
   */
  parseContent(content: string, filePath: string = 'temp.ts'): SourceFile {
    return this.project.createSourceFile(filePath, content, {
      overwrite: true,
    });
  }

  /**
   * 解析类的字段定义
   */
  parseClassFields(content: string, className?: string): DtoField[] {
    const sourceFile = this.parseContent(content);
    const classDeclaration = className ? sourceFile.getClass(className) : sourceFile.getClasses()[0];

    if (!classDeclaration) return [];

    const fields: DtoField[] = [];

    // 解析属性字段
    classDeclaration.getProperties().forEach((property) => {
      const field = this.parseProperty(property);
      if (field) {
        fields.push(field);
      }
    });

    // 总是尝试从类体文本中解析，以捕获复杂的内联对象类型
    const classText = classDeclaration.getText();
    const classBodyMatch = classText.match(/\{([\s\S]*)\}/);
    if (classBodyMatch) {
      const classBody = classBodyMatch[1];
      const textFields = this.parseClassBodyText(classBody);

      // 合并字段，智能选择更完整的解析结果
      const fieldMap = new Map<string, DtoField>();

      // 先添加 AST 解析的字段
      fields.forEach((field) => fieldMap.set(field.name, field));

      // 添加文本解析的字段，但优先保留 AST 解析的完整结果
      textFields.forEach((field) => {
        const existingField = fieldMap.get(field.name);
        if (!existingField) {
          // 如果 AST 没有解析到这个字段，直接添加
          fieldMap.set(field.name, field);
        } else {
          // 对于内联对象类型，优先使用 AST 解析结果（更准确）
          const isInlineObjectType = existingField.type.includes('{') || field.type.includes('{');

          if (isInlineObjectType) {
            // 检查哪个解析结果更完整
            const astHasCompleteBraces =
              existingField.type.includes('{') &&
              existingField.type.includes('}') &&
              (existingField.type.match(/\{/g) || []).length === (existingField.type.match(/\}/g) || []).length;
            const textHasCompleteBraces =
              field.type.includes('{') &&
              field.type.includes('}') &&
              (field.type.match(/\{/g) || []).length === (field.type.match(/\}/g) || []).length;

            // 如果 AST 解析结果有完整的大括号对，优先使用 AST 结果
            if (astHasCompleteBraces && !textHasCompleteBraces) {
              // 保持 AST 解析结果，不覆盖
            } else if (textHasCompleteBraces && field.type.length > existingField.type.length) {
              // 只有当文本解析结果更完整时才覆盖
              fieldMap.set(field.name, field);
            }
          } else {
            // 对于非内联对象类型，如果文本解析结果更长，使用文本解析结果
            if (field.type.length > existingField.type.length * 1.2) {
              fieldMap.set(field.name, field);
            }
          }
        }
      });

      // 调试日志
      if (className === 'TodoDto') {
        console.log(
          `[DEBUG] AST fields for ${className}:`,
          fields.map((f) => `${f.name}: ${f.type}`)
        );
        console.log(
          `[DEBUG] Text fields for ${className}:`,
          textFields.map((f) => `${f.name}: ${f.type}`)
        );

        // 调试 repeatConfig 字段的合并决策
        const repeatConfigAST = fields.find((f) => f.name === 'repeatConfig');
        const repeatConfigText = textFields.find((f) => f.name === 'repeatConfig');
        const finalRepeatConfig = Array.from(fieldMap.values()).find((f) => f.name === 'repeatConfig');

        console.log(`[DEBUG] repeatConfig merge analysis:`, {
          hasAST: !!repeatConfigAST,
          hasText: !!repeatConfigText,
          astType: repeatConfigAST?.type.substring(0, 100) + '...',
          textType: repeatConfigText?.type,
          finalType: finalRepeatConfig?.type.substring(0, 100) + '...',
        });

        console.log(
          `[DEBUG] Final merged fields:`,
          Array.from(fieldMap.values()).map((f) => `${f.name}: ${f.type}`)
        );
      }

      return Array.from(fieldMap.values());
    }

    return fields;
  }

  /**
   * 从类体文本中解析字段（回退方法）
   */
  private parseClassBodyText(classBody: string): DtoField[] {
    const fields: DtoField[] = [];

    // 移除方法定义
    const cleanedBody = classBody.replace(/\w+\([^)]*\)\s*\{[^}]*\}/g, '');

    // 处理多行内联对象类型的字段定义
    const lines = cleanedBody.split('\n');
    let currentField = '';
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 跳过空行和注释
      if (!line || line.startsWith('//') || line.startsWith('/*')) continue;

      currentField += line + ' ';

      // 计算大括号深度
      for (const char of line) {
        if (char === '{') braceDepth++;
        if (char === '}') braceDepth--;
      }

      // 如果大括号平衡且以分号或大括号结尾，说明字段定义完整
      if (braceDepth === 0 && (line.endsWith(';') || line.endsWith('}'))) {
        const field = this.parseFieldFromText(currentField.trim());
        if (field) {
          fields.push(field);
        }
        currentField = '';
      }
    }

    // 处理最后一个字段（如果没有分号结尾）
    if (currentField.trim()) {
      const field = this.parseFieldFromText(currentField.trim());
      if (field) {
        fields.push(field);
      }
    }

    return fields;
  }

  /**
   * 从文本中解析单个字段
   */
  private parseFieldFromText(fieldText: string): DtoField | null {
    // 匹配字段定义：fieldName?: type
    const fieldMatch = fieldText.match(/^\s*(\w+)([?!]?):\s*([\s\S]+?)(?:[;=]|$)/);
    if (!fieldMatch) return null;

    const [, fieldName, modifier, fieldType] = fieldMatch;

    if (!fieldName || fieldName.length < 2) return null;

    // 跳过方法名
    if (fieldName.includes('import') || fieldName.includes('export')) return null;

    const { type, isArray } = this.parseFieldType(fieldType.trim());

    return {
      name: fieldName.trim(),
      type,
      optional: modifier === '?',
      isArray,
      decorators: [],
    };
  }

  /**
   * 解析单个属性
   */
  private parseProperty(property: PropertyDeclaration): DtoField | null {
    const name = property.getName();
    if (!name) return null;

    const typeNode = property.getTypeNode();
    if (!typeNode) return null;

    const typeText = typeNode.getText();
    const { type, isArray } = this.parseFieldType(typeText);

    const optional = property.hasQuestionToken();
    const decorators = this.parseDecorators(property.getDecorators());

    return {
      name,
      type,
      optional,
      isArray,
      decorators,
    };
  }

  /**
   * 解析字段类型，处理数组和复杂类型
   */
  private parseFieldType(typeText: string): { type: string; isArray: boolean } {
    // 移除空白字符
    const cleanType = typeText.trim();

    // 检查是否为数组类型
    if (cleanType.endsWith('[]')) {
      return {
        type: cleanType.slice(0, -2).trim(),
        isArray: true,
      };
    }

    // 检查 Array<T> 语法
    const arrayMatch = cleanType.match(/^Array<(.+)>$/);
    if (arrayMatch) {
      return {
        type: arrayMatch[1].trim(),
        isArray: true,
      };
    }

    return {
      type: cleanType,
      isArray: false,
    };
  }

  /**
   * 解析装饰器
   */
  private parseDecorators(decorators: Decorator[]): string[] {
    return decorators.map((decorator) => decorator.getText());
  }

  /**
   * 获取类名
   */
  parseClassName(content: string): string | null {
    const sourceFile = this.parseContent(content);
    const classDeclaration = sourceFile.getClasses()[0];
    return classDeclaration?.getName() || null;
  }

  /**
   * 从源类中获取字段定义
   */
  getFieldsFromSource(sourceClass: string, content: string): DtoField[] {
    return this.parseClassFields(content, sourceClass);
  }

  /**
   * 获取类体范围
   */
  getClassBodyRange(content: string, className: string): { start: number; end: number } | null {
    const sourceFile = this.parseContent(content);
    const classDeclaration = sourceFile.getClass(className);
    if (!classDeclaration) return null;

    const classText = classDeclaration.getText();
    const openBraceIndex = classText.indexOf('{');
    const closeBraceIndex = classText.lastIndexOf('}');

    if (openBraceIndex === -1 || closeBraceIndex === -1) return null;

    const classStart = classDeclaration.getStart();
    const start = classStart + openBraceIndex + 1;
    const end = classStart + closeBraceIndex;

    return { start, end };
  }

  /**
   * 清理项目缓存
   */
  dispose() {
    this.project.getSourceFiles().forEach((file) => file.delete());
  }
}

// 创建全局实例
export const dtoAstParser = new DtoASTParser();
