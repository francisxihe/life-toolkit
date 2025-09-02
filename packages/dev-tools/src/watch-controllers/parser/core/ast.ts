import {
  Project,
  SourceFile,
  ClassDeclaration,
  MethodDeclaration,
  Decorator,
  SyntaxKind,
  ScriptTarget,
  ModuleKind,
  StringLiteral,
} from "ts-morph";

export interface ASTMethodDecoratorInfo {
  name: string;
  verb: string;
  path: string;
  paramStyle: "none" | "id" | "id+body" | "query" | "body";
  description?: string;
  paramTypes?: {
    idType?: string;
    bodyType?: string;
    queryType?: string;
  };
  returnType?: string;
  fullSignature?: string;
}

export interface ASTControllerInfo {
  className: string;
  basePath?: string;
  methods: Map<string, ASTMethodDecoratorInfo>;
}

export class TypeScriptASTParser {
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

  // 解析TypeScript文件内容，返回AST
  parseContent(content: string, filePath: string = "temp.ts"): SourceFile {
    return this.project.createSourceFile(filePath, content, {
      overwrite: true,
    });
  }

  // 获取类名
  parseClassName(content: string): string | null {
    const sourceFile = this.parseContent(content);
    const classDeclaration = sourceFile.getClasses()[0];
    return classDeclaration?.getName() || null;
  }

  // 获取构造函数的服务类型
  parseConstructorServiceTypes(content: string): string[] {
    const sourceFile = this.parseContent(content);
    const classDeclaration = sourceFile.getClasses()[0];
    if (!classDeclaration) return [];

    const constructor = classDeclaration.getConstructors()[0];
    if (!constructor) return [];

    return constructor.getParameters().map((param) => {
      const typeNode = param.getTypeNode();
      return typeNode?.getText() || "any";
    });
  }

  // 获取类的所有方法名
  parseMethodNames(content: string, className?: string): string[] {
    const sourceFile = this.parseContent(content);
    const classDeclaration = className
      ? sourceFile.getClass(className)
      : sourceFile.getClasses()[0];

    if (!classDeclaration) return [];

    return classDeclaration.getMethods().map((method) => method.getName());
  }

  // 解析控制器信息（包含类装饰器和方法装饰器）
  parseControllerInfo(
    content: string,
    className?: string
  ): ASTControllerInfo | null {
    const sourceFile = this.parseContent(content);
    const classDeclaration = className
      ? sourceFile.getClass(className)
      : sourceFile.getClasses()[0];

    if (!classDeclaration) return null;

    // 解析类装饰器
    const basePath = this.parseControllerDecorator(classDeclaration);

    // 解析方法装饰器
    const methodMap = new Map<string, ASTMethodDecoratorInfo>();
    classDeclaration.getMethods().forEach((method) => {
      const decoratorInfo = this.parseMethodDecorator(method);
      if (decoratorInfo) {
        methodMap.set(method.getName(), decoratorInfo);
      }
    });

    return {
      className: classDeclaration.getName() || "UnknownController",
      basePath,
      methods: methodMap,
    };
  }

  // 解析方法装饰器信息（保持向后兼容）
  parseMethodDecorators(
    content: string,
    className?: string
  ): Map<string, ASTMethodDecoratorInfo> {
    const controllerInfo = this.parseControllerInfo(content, className);
    return controllerInfo?.methods || new Map();
  }

  // 解析方法装饰器信息
  private parseMethodDecorator(
    method: MethodDeclaration
  ): ASTMethodDecoratorInfo | null {
    const decorators = method.getDecorators();
    const httpDecorator = decorators.find((decorator) =>
      ["Get", "Post", "Put", "Delete"].includes(decorator.getName())
    );

    if (!httpDecorator) return null;

    const verb = httpDecorator.getName();
    const decoratorArgs = this.parseDecoratorArguments(httpDecorator);
    const path = decoratorArgs.path || `/${method.getName()}`;
    const description = decoratorArgs.description;

    // 解析方法签名
    const parameters = method.getParameters();
    const returnType = this.extractReturnType(method);
    const fullSignature = method.getText();

    // 分析参数样式
    const paramAnalysis = this.analyzeParameters(parameters, path);

    return {
      name: method.getName(),
      verb,
      path,
      paramStyle: paramAnalysis.style,
      description,
      paramTypes: paramAnalysis.types,
      returnType,
      fullSignature,
    };
  }

  // 解析Controller装饰器
  private parseControllerDecorator(
    classDeclaration: ClassDeclaration
  ): string | undefined {
    const decorators = classDeclaration.getDecorators();
    const controllerDecorator = decorators.find(
      (decorator) => decorator.getName() === "Controller"
    );

    if (!controllerDecorator) return undefined;

    const args = controllerDecorator.getArguments();
    if (args.length === 0) return undefined;

    const firstArg = args[0];
    if (firstArg.getKind() === SyntaxKind.StringLiteral) {
      return (firstArg as StringLiteral).getLiteralValue();
    }

    return undefined;
  }

  // 解析装饰器参数
  private parseDecoratorArguments(decorator: Decorator): {
    path?: string;
    description?: string;
  } {
    const args = decorator.getArguments();
    if (args.length === 0) return {};

    const firstArg = args[0];
    let path: string | undefined;
    let description: string | undefined;

    // 第一个参数通常是路径字符串
    if (firstArg.getKind() === SyntaxKind.StringLiteral) {
      path = (firstArg as StringLiteral).getLiteralValue();
    }

    // 第二个参数可能是配置对象
    if (
      args.length > 1 &&
      args[1].getKind() === SyntaxKind.ObjectLiteralExpression
    ) {
      const configObj = args[1];
      const descProperty = configObj
        .getChildrenOfKind(SyntaxKind.PropertyAssignment)
        .find((prop) => prop.getName() === "description");

      if (descProperty) {
        const initializer = descProperty.getInitializer();
        if (initializer?.getKind() === SyntaxKind.StringLiteral) {
          description = (initializer as StringLiteral).getLiteralValue();
        }
      }
    }

    return { path, description };
  }

  // 提取方法返回类型
  private extractReturnType(method: MethodDeclaration): string | undefined {
    const returnTypeNode = method.getReturnTypeNode();
    if (!returnTypeNode) return undefined;

    const returnTypeText = returnTypeNode.getText();

    // 提取Promise<T>中的T
    const promiseMatch = returnTypeText.match(/Promise<(.+)>/);
    return promiseMatch ? promiseMatch[1] : returnTypeText;
  }

  // 分析参数样式和类型
  private analyzeParameters(
    parameters: any[],
    path: string
  ): {
    style: "none" | "id" | "id+body" | "query" | "body";
    types: { idType?: string; bodyType?: string; queryType?: string };
  } {
    if (parameters.length === 0) {
      return { style: "none", types: {} };
    }

    const hasIdParam = path.includes("/:id");
    const types: { idType?: string; bodyType?: string; queryType?: string } = {};

    // 分析参数类型
    parameters.forEach((param) => {
      const paramName = param.getName();
      const paramType = param.getTypeNode()?.getText() || "any";

      if (paramName === "id") {
        types.idType = paramType;
      } else if (paramName.includes("query") || paramName.includes("params")) {
        types.queryType = paramType;
      } else {
        types.bodyType = paramType;
      }
    });

    // 确定参数样式
    if (hasIdParam && parameters.length > 1) {
      return { style: "id+body", types };
    } else if (hasIdParam) {
      return { style: "id", types };
    } else if (
      parameters.some(
        (p) => p.getName().includes("query") || p.getName().includes("params")
      )
    ) {
      return { style: "query", types };
    } else {
      return { style: "body", types };
    }
  }

  // 获取类体范围（用于兼容现有API）
  getClassBodyRange(
    content: string,
    className: string
  ): { start: number; end: number } | null {
    const sourceFile = this.parseContent(content);
    const classDeclaration = sourceFile.getClass(className);
    if (!classDeclaration) return null;

    // 获取类声明的开始和结束位置
    const classText = classDeclaration.getText();
    const openBraceIndex = classText.indexOf("{");
    const closeBraceIndex = classText.lastIndexOf("}");

    if (openBraceIndex === -1 || closeBraceIndex === -1) return null;

    const classStart = classDeclaration.getStart();
    const start = classStart + openBraceIndex + 1;
    const end = classStart + closeBraceIndex;

    return { start, end };
  }

  // 清理项目缓存
  dispose() {
    // ts-morph会自动管理内存，但可以显式清理
    this.project.getSourceFiles().forEach((file) => file.delete());
  }
}

// 创建全局实例
export const astParser = new TypeScriptASTParser();
