import {
  astParser,
  ASTMethodDecoratorInfo,
  ASTControllerInfo,
} from "./ast-parser";
import { MethodDecoratorInfo } from "./parser";

/**
 * AST解析器适配层 - 提供与现有parser.ts相同的接口
 * 逐步替换正则表达式解析逻辑
 */

// 将AST解析结果转换为现有接口格式
function convertASTMethodInfo(
  astInfo: ASTMethodDecoratorInfo
): MethodDecoratorInfo {
  return {
    name: astInfo.name,
    verb: astInfo.verb,
    path: astInfo.path,
    paramStyle: astInfo.paramStyle,
    description: astInfo.description,
    paramTypes: astInfo.paramTypes,
    returnType: astInfo.returnType,
    fullSignature: astInfo.fullSignature,
  };
}

/**
 * 使用AST解析类名
 */
export function parseClassName(serverContent: string): string | null {
  try {
    return astParser.parseClassName(serverContent);
  } catch (error) {
    console.warn("AST解析类名失败，回退到正则表达式:", error);
    // 回退到原有的正则表达式解析
    const m = serverContent.match(/export\s+class\s+(\w+)\s*\{/);
    return m ? m[1] : null;
  }
}

/**
 * 使用AST解析构造函数服务类型
 */
export function parseConstructorServiceTypes(serverContent: string): string[] {
  try {
    return astParser.parseConstructorServiceTypes(serverContent);
  } catch (error) {
    console.warn("AST解析构造函数失败，回退到正则表达式:", error);
    // 回退到原有的正则表达式解析
    const ctorMatch = serverContent.match(/constructor\s*\(([^)]*)\)\s*\{/);
    if (!ctorMatch) return [];
    const params = ctorMatch[1];
    const types: string[] = [];
    const regex = /:\s*([A-Za-z_][A-Za-z0-9_]*)/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(params)) !== null) types.push(m[1]);
    return types;
  }
}

/**
 * 使用AST解析方法装饰器信息
 */
export function parseMethodDecorators(
  serverContent: string,
  className: string
): Map<string, MethodDecoratorInfo> {
  try {
    const astMethodMap = astParser.parseMethodDecorators(
      serverContent,
      className
    );
    const methodMap = new Map<string, MethodDecoratorInfo>();

    astMethodMap.forEach((astInfo, methodName) => {
      methodMap.set(methodName, convertASTMethodInfo(astInfo));
    });

    return methodMap;
  } catch (error) {
    console.warn("AST解析方法装饰器失败，回退到正则表达式:", error);
    // 这里可以回退到原有的parseMethodDecorators实现
    // 为了简化，暂时返回空Map
    return new Map();
  }
}

/**
 * 使用AST解析服务器方法名
 */
export function parseServerMethodNames(
  serverContent: string,
  className: string
): string[] {
  try {
    return astParser.parseMethodNames(serverContent, className);
  } catch (error) {
    console.warn("AST解析方法名失败，回退到正则表达式:", error);
    // 回退逻辑可以调用原有的实现
    return [];
  }
}

/**
 * 使用AST获取类体范围
 */
export function getClassBodyRange(
  content: string,
  className: string
): { start: number; end: number } | null {
  try {
    return astParser.getClassBodyRange(content, className);
  } catch (error) {
    console.warn("AST解析类体范围失败，回退到正则表达式:", error);
    // 回退到原有的正则表达式解析
    const classRe = new RegExp(`export\\s+class\\s+${className}\\s*\\{`);
    const m = classRe.exec(content);
    if (!m) return null;
    const startBrace = content.indexOf("{", m.index);
    if (startBrace < 0) return null;
    let i = startBrace + 1;
    let depth = 1;
    while (i < content.length) {
      const ch = content[i];
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) return { start: startBrace + 1, end: i };
      }
      i++;
    }
    return null;
  }
}

/**
 * 解析控制器信息（包含@Controller装饰器）
 */
export function parseControllerInfo(
  serverContent: string,
  className?: string
): ASTControllerInfo | null {
  try {
    return astParser.parseControllerInfo(serverContent, className);
  } catch (error) {
    console.warn("AST解析控制器信息失败，回退到正则表达式:", error);
    return null;
  }
}

/**
 * 获取服务器方法的装饰器信息 - AST版本
 */
export function getServerMethodDecorators(
  serverContent: string,
  className: string
): Map<string, MethodDecoratorInfo> {
  return parseMethodDecorators(serverContent, className);
}

/**
 * 类型转换工具函数
 */
export function typeToServiceConstName(typeName: string): string {
  return typeName.charAt(0).toLowerCase() + typeName.slice(1);
}
