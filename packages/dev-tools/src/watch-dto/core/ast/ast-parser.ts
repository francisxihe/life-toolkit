/**
 * DTO AST 解析器
 * 提供 TypeScript DTO 文件的 AST 解析功能
 */

import { Project, PropertyDeclaration, Decorator, SyntaxKind, PropertySignature } from 'ts-morph';
import {
  ASTClassInfo,
  ASTDecorator,
  ASTDecoratorArgument,
  ASTProperty,
  ASTImport,
  ASTImportSpecifier,
  ASTSourceLocation,
  ASTExtends,
} from './ast-types';

/**
 * DTO AST 解析器
 * 专门用于解析 DTO 类文件
 */
export class ASTParser {
  private project: Project;

  constructor() {
    this.project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: 99, // Latest
        module: 1, // CommonJS
        strict: false,
        skipLibCheck: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    });
  }

  /**
   * 解析 TypeScript DTO 代码为 AST 结构
   */
  parse(code: string, filePath: string): ASTClassInfo {
    const sourceFile = this.project.createSourceFile(filePath, code, { overwrite: true });

    const classes = sourceFile.getClasses();
    const classDeclaration = filePath.includes('model.dto.ts')
      ? classes.find((item) => {
          const name = item.getName() || '';
          return name.endsWith('Dto') && !name.includes('WithoutRelations');
        }) || classes[0]
      : classes[0];
    if (!classDeclaration) {
      throw new Error(`No class found in ${filePath}`);
    }

    const className = classDeclaration.getName();
    if (!className) {
      throw new Error(`Class name not found in ${filePath}`);
    }

    // 确定 DTO 类型
    const dtoType = this.determineDtoType(className, filePath);

    return {
      className,
      properties: this.parseProperties(classDeclaration.getProperties()),
      imports: this.parseImports(sourceFile.getImportDeclarations()),
      sourceFile,
      classDeclaration,
      dtoType,
      isDefaultExport: this.checkIsDefaultExport(classDeclaration),
      extends: this.parseExtends(classDeclaration),
    };
  }

  /**
   * 确定 DTO 类型
   */
  private determineDtoType(className: string, filePath: string): 'model' | 'form' | 'filter' {
    if (filePath.includes('filter.dto.ts') || className.includes('Filter')) {
      return 'filter';
    }
    if (filePath.includes('form.dto.ts') || className.startsWith('Create') || className.startsWith('Update')) {
      return 'form';
    }
    return 'model';
  }

  /**
   * 解析类属性
   */
  private parseProperties(properties: PropertyDeclaration[]): ASTProperty[] {
    return properties.map((property) => ({
      name: property.getName(),
      type: property.getTypeNode()?.getText() || property.getType().getText(),
      optional: property.hasQuestionToken(),
      decorators: this.parseDecorators(property.getDecorators()),
      sourceLocation: this.getSourceLocation(property),
      hasInitializer: Boolean(property.getInitializer()),
      initializer: property.getInitializer()?.getText(),
    }));
  }

  /**
   * 解析装饰器
   */
  private parseDecorators(decorators: Decorator[]): ASTDecorator[] {
    return decorators.map((decorator) => ({
      name: decorator.getName(),
      arguments: this.parseDecoratorArguments(decorator),
    }));
  }

  /**
   * 解析装饰器参数
   */
  private parseDecoratorArguments(decorator: Decorator): ASTDecoratorArgument[] {
    return decorator.getArguments().map((arg) => {
      const rawText = arg.getText();
      const kind = arg.getKind();

      let type: 'string' | 'object' | 'array' | 'other' = 'other';
      let value = rawText;

      if (kind === SyntaxKind.StringLiteral || kind === SyntaxKind.NoSubstitutionTemplateLiteral) {
        type = 'string';
        value = rawText.slice(1, -1); // 移除引号
      } else if (kind === SyntaxKind.ObjectLiteralExpression) {
        type = 'object';
      } else if (kind === SyntaxKind.ArrayLiteralExpression) {
        type = 'array';
      }

      return {
        type,
        value,
        rawText,
      };
    });
  }

  /**
   * 解析导入声明
   */
  private parseImports(imports: any[]): ASTImport[] {
    return imports.map((importDecl) => {
      const source = importDecl.getModuleSpecifierValue();
      const namedImports = importDecl.getNamedImports();
      const defaultImport = importDecl.getDefaultImport()?.getText();
      const namespaceImport = importDecl.getNamespaceImport()?.getText();

      const specifiers: ASTImportSpecifier[] = [];

      if (defaultImport) {
        specifiers.push({
          imported: 'default',
          local: defaultImport,
        });
      }

      if (namespaceImport) {
        specifiers.push({
          imported: '*',
          local: namespaceImport,
        });
      }

      namedImports.forEach((namedImport: any) => {
        const imported = namedImport.getName();
        const local = namedImport.getAliasNode()?.getText() || imported;
        specifiers.push({
          imported,
          local,
        });
      });

      let importType: 'default' | 'named' | 'namespace' | 'type' = 'named';
      if (defaultImport) importType = 'default';
      if (namespaceImport) importType = 'namespace';
      if (importDecl.isTypeOnly()) importType = 'type';

      return {
        specifiers,
        source,
        importType,
      };
    });
  }

  /**
   * 解析继承信息
   */
  private parseExtends(classDeclaration: any): ASTExtends | undefined {
    const extendsExpression = classDeclaration.getExtends();
    if (!extendsExpression) {
      return undefined;
    }

    const fullText = extendsExpression.getText();
    const expression = extendsExpression.getExpression();
    const className = expression.getText();

    const typeArgs = extendsExpression.getTypeArguments();
    const typeArguments = typeArgs.length > 0 ? typeArgs.map((arg: any) => arg.getText()) : undefined;

    return {
      className,
      typeArguments,
      fullText,
    };
  }

  /**
   * 获取源码位置信息
   */
  private getSourceLocation(node: PropertyDeclaration | PropertySignature): ASTSourceLocation {
    const start = node.getStart();
    const end = node.getEnd();
    const sourceFile = node.getSourceFile();
    const startLineAndColumn = sourceFile.getLineAndColumnAtPos(start);
    const endLineAndColumn = sourceFile.getLineAndColumnAtPos(end);

    return {
      startLine: startLineAndColumn.line,
      startColumn: startLineAndColumn.column,
      endLine: endLineAndColumn.line,
      endColumn: endLineAndColumn.column,
    };
  }

  /**
   * 检查类是否使用 export default
   */
  private checkIsDefaultExport(classDeclaration: any): boolean {
    const sourceFile = classDeclaration.getSourceFile();
    const exportAssignments = sourceFile.getExportAssignments();

    for (const exportAssignment of exportAssignments) {
      if (exportAssignment.isExportEquals() === false) {
        const expression = exportAssignment.getExpression();
        if (expression && expression.getText() === classDeclaration.getName()) {
          return true;
        }
      }
    }

    return classDeclaration.hasModifier(SyntaxKind.DefaultKeyword);
  }
}
