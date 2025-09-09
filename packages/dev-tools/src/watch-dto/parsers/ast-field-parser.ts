import {
  Project,
  SourceFile,
  ClassDeclaration,
  PropertyDeclaration,
  SyntaxKind,
  ScriptTarget,
  ModuleKind,
  Decorator,
} from "ts-morph";

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
  parseContent(content: string, filePath: string = "temp.ts"): SourceFile {
    return this.project.createSourceFile(filePath, content, {
      overwrite: true,
    });
  }

  /**
   * 解析类的字段定义
   */
  parseClassFields(content: string, className?: string): DtoField[] {
    const sourceFile = this.parseContent(content);
    const classDeclaration = className
      ? sourceFile.getClass(className)
      : sourceFile.getClasses()[0];

    if (!classDeclaration) return [];

    const fields: DtoField[] = [];
    
    // 解析属性字段
    classDeclaration.getProperties().forEach((property) => {
      const field = this.parseProperty(property);
      if (field) {
        fields.push(field);
      }
    });

    // 如果没有找到属性，尝试从类体文本中直接解析
    if (fields.length === 0) {
      const classText = classDeclaration.getText();
      const classBodyMatch = classText.match(/\{([\s\S]*)\}/);
      if (classBodyMatch) {
        const classBody = classBodyMatch[1];
        return this.parseClassBodyText(classBody);
      }
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
    
    // 匹配字段定义
    const fieldRegex = /^\s*(\w+)([?!]?):\s*([^;=\n]+)(?:[;=]|$)/gm;
    let match;

    while ((match = fieldRegex.exec(cleanedBody)) !== null) {
      const [, fieldName, modifier, fieldType] = match;

      if (!fieldName || fieldName.length < 2) continue;
      
      // 跳过方法名
      if (fieldName.includes('import') || fieldName.includes('export')) continue;

      const { type, isArray } = this.parseFieldType(fieldType.trim());

      fields.push({
        name: fieldName.trim(),
        type,
        optional: modifier === '?',
        isArray,
        decorators: [],
      });
    }

    return fields;
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
    return decorators.map(decorator => decorator.getText());
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
  getClassBodyRange(
    content: string,
    className: string
  ): { start: number; end: number } | null {
    const sourceFile = this.parseContent(content);
    const classDeclaration = sourceFile.getClass(className);
    if (!classDeclaration) return null;

    const classText = classDeclaration.getText();
    const openBraceIndex = classText.indexOf("{");
    const closeBraceIndex = classText.lastIndexOf("}");

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
