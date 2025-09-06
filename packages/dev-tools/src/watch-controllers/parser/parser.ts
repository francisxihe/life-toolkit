// Parsing and scanning utilities for controller files
import { MethodDecoratorInfo } from "../types";


// ===== Brace/paren aware scanners =====
export function findMethodBodyOpenBraceIndex(
  body: string,
  parenIndex: number
): number {
  let i = parenIndex;
  let paren = 1; // we're on '('
  let angle = 0;
  let square = 0;
  let braceType = 0;
  let inLineComment = false;
  let inBlockComment = false;
  let inString: false | '"' | "'" | "`" = false;
  let escaped = false;
  while (i < body.length) {
    i++;
    const ch = body[i];
    const prev = body[i - 1];
    if (inLineComment) {
      if (ch === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (prev === "*" && ch === "/") inBlockComment = false;
      continue;
    }
    if (!inString) {
      if (prev === "/" && ch === "/") {
        inLineComment = true;
        continue;
      }
      if (prev === "/" && ch === "*") {
        inBlockComment = true;
        continue;
      }
    }
    if (inString) {
      if (!escaped && ch === inString) inString = false;
      escaped = !escaped && ch === "\\";
      continue;
    } else if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch as '"' | "'" | "`";
      escaped = false;
      continue;
    }
    if (ch === "(") {
      paren++;
      continue;
    }
    if (ch === ")") {
      paren--;
      if (paren < 0) paren = 0;
      continue;
    }
    if (paren === 0) {
      if (ch === "<") {
        angle++;
        continue;
      }
      if (ch === ">") {
        if (angle > 0) angle--;
        continue;
      }
      if (ch === "[") {
        square++;
        continue;
      }
      if (ch === "]") {
        if (square > 0) square--;
        continue;
      }
      if (ch === "{") {
        if (braceType === 0 && angle === 0 && square === 0) return i;
        braceType++;
        continue;
      }
      if (ch === "}") {
        if (braceType > 0) braceType--;
        continue;
      }
    }
  }
  return -1;
}

// ===== Top-level method block detection (fallback) =====
export function findAllTopLevelMethodBlocks(
  body: string
): Array<{ name: string; start: number; end: number }> {
  const results: Array<{ name: string; start: number; end: number }> = [];
  const sigRe =
    /(^|\n)\s*(?:public|private|protected)?\s*(?:async\s+)?([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = sigRe.exec(body)) !== null) {
    const name = m[2];
    const parenPos = sigRe.lastIndex - 1;
    const bracePos = findMethodBodyOpenBraceIndex(body, parenPos);
    if (bracePos === -1) continue;
    const prefix = body.slice(0, bracePos);
    let depth = 0;
    for (let i = 0; i < prefix.length; i++) {
      const ch = prefix[i];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
    }
    if (depth !== 0) continue;
    let start = m.index;
    while (start > 0 && body[start - 1] !== "\n") start--;
    let i = bracePos;
    let d = 1;
    while (i < body.length && d > 0) {
      i++;
      const ch = body[i];
      if (ch === "{") d++;
      else if (ch === "}") d--;
    }
    const end = i + 1;
    results.push({ name, start, end });
  }
  return results;
}

// ===== Name collection / occurrences =====
export function collectAllMethodNames(body: string): Set<string> {
  const names = new Set<string>();
  // 更新正则表达式以支持复杂的装饰器参数，包括对象字面量
  const re =
    /(^|\n)\s*(?:@[A-Za-z_][A-Za-z0-9_]*\([^)]*(?:\{[^}]*\}[^)]*)?\)\s*[\r\n\s]*)*(?:public|private|protected)?\s*(?:async\s+)?([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) names.add(m[2]);
  return names;
}

export function getMethodOccurrences(
  body: string,
  name: string
): Array<{ start: number; end: number }> {
  const occurrences: Array<{ start: number; end: number }> = [];
  // 更新正则表达式以支持复杂的装饰器参数，包括对象字面量
  // 同时支持可选的访问修饰符、static、async 关键字
  const nameRe = new RegExp(
    `(^|\\n)\\s*(?:@[A-Za-z_][A-Za-z0-9_]*\\([^)]*(?:\\{[^}]*\\}[^)]*)?\\)\\s*[\\r\\n\\s]*)*` +
      `(?:public|private|protected)?\\s*(?:static\\s+)?(?:async\\s+)?${name}\\s*\\(`,
    "g"
  );
  let m: RegExpExecArray | null;
  while ((m = nameRe.exec(body)) !== null) {
    let start = m.index;
    while (start > 0 && body[start - 1] !== "\n") start--;
    while (start > 0) {
      const prevLineStart = body.lastIndexOf("\n", start - 2) + 1;
      const prevLine = body.slice(prevLineStart, start);
      if (/^\s*@/.test(prevLine)) start = prevLineStart;
      else break;
    }
    const parenPos = body.indexOf("(", m.index);
    if (parenPos === -1) continue;
    const openBrace = findMethodBodyOpenBraceIndex(body, parenPos);
    if (openBrace === -1) continue;
    let i = openBrace;
    let depth = 1;
    while (i < body.length && depth > 0) {
      i++;
      const ch = body[i];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
    }
    const end = i + 1;
    occurrences.push({ start, end });
  }
  return occurrences;
}

// ===== Class / method parsing =====
export function getClassBodyRange(
  content: string,
  className: string
): { start: number; end: number } | null {
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

export function parseClassName(serverContent: string): string | null {
  const m = serverContent.match(/export\s+class\s+(\w+)\s*\{/);
  return m ? m[1] : null;
}

export function parseConstructorServiceTypes(serverContent: string): string[] {
  const ctorMatch = serverContent.match(/constructor\s*\(([^)]*)\)\s*\{/);
  if (!ctorMatch) return [];
  const params = ctorMatch[1];
  const types: string[] = [];
  const regex = /:\s*([A-Za-z_][A-Za-z0-9_]*)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(params)) !== null) types.push(m[1]);
  return types;
}

export function typeToServiceConstName(typeName: string): string {
  return typeName.charAt(0).toLowerCase() + typeName.slice(1);
}

const RESERVED = new Set([
  "constructor",
  "if",
  "for",
  "while",
  "switch",
  "catch",
  "try",
  "finally",
  "return",
  "const",
  "let",
  "var",
  "default",
  "class",
  "extends",
  "new",
]);

export function parseTopLevelMethodNames(body: string): string[] {
  const names: string[] = [];
  let depth = 0;
  const lines = body.split("\n");
  for (const line of lines) {
    if (depth === 0) {
      const m = line.match(
        /^\s*(?:public|private|protected)?\s*(?:async\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*\([^;]*\)\s*(?::[^\{\n]+)?\s*\{/
      );
      if (m) {
        const name = m[1];
        if (!RESERVED.has(name)) names.push(name);
      }
    }
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    depth += opens - closes;
  }
  return names;
}

export function parseServerMethodNames(
  serverContent: string,
  className: string
): string[] {
  const range = getClassBodyRange(serverContent, className);
  if (!range) return [];
  const body = serverContent.slice(range.start, range.end);
  return parseTopLevelMethodNames(body);
}

// 获取服务器方法的装饰器信息
export function getServerMethodDecorators(
  serverContent: string,
  className: string
): Map<string, MethodDecoratorInfo> {
  return parseMethodDecorators(serverContent, className);
}

// 解析 API controller 中的现有方法
export function parseApiMethodNames(
  apiContent: string,
  className: string
): Set<string> {
  const range = getApiClassBodyRange(apiContent, className);
  if (!range) return new Set();

  const body = apiContent.slice(range.start, range.end);
  const methodNames = new Set<string>();

  // 匹配静态方法
  const methodRegex = /static\s+async\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
  let match;
  while ((match = methodRegex.exec(body)) !== null) {
    methodNames.add(match[1]);
  }

  return methodNames;
}

export function parseDesktopMethodNames(
  desktopContent: string,
  className: string
): Set<string> {
  const range = getClassBodyRange(desktopContent, className);
  if (!range) return new Set();
  const body = desktopContent.slice(range.start, range.end);
  return new Set(parseTopLevelMethodNames(body));
}

export function parseMethodDecorators(
  serverContent: string,
  className: string
): Map<string, MethodDecoratorInfo> {
  const range = getClassBodyRange(serverContent, className);
  if (!range) return new Map();
  const body = serverContent.slice(range.start, range.end);

  const methodMap = new Map<string, MethodDecoratorInfo>();

  // 按行分割，逐行解析
  const lines = body.split("\n");
  let currentDecorator: { verb: string; args: string } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 匹配装饰器行
    const decoratorMatch = line.match(
      /^@(Get|Post|Put|Delete)\s*\(\s*(.+)\s*\)\s*$/
    );
    if (decoratorMatch) {
      currentDecorator = {
        verb: decoratorMatch[1],
        args: decoratorMatch[2],
      };
      continue;
    }

    // 匹配方法定义行
    const methodMatch = line.match(
      /^(?:public|private|protected)?\s*(?:async\s+)?([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/
    );
    if (methodMatch && currentDecorator) {
      const methodName = methodMatch[1];

      // 解析装饰器参数
      let path = "";
      let description = "";

      try {
        // 解析路径和描述
        const argsMatch = currentDecorator.args.match(
          /^\s*["']([^"']+)["'](?:\s*,\s*\{\s*description\s*:\s*["']([^"']+)["']\s*\})?/
        );
        if (argsMatch) {
          path = argsMatch[1];
          description = argsMatch[2] || "";
        }
      } catch (e) {
        path = `/${methodName}`;
      }

      // 获取完整的方法签名来判断参数
      let fullMethodLine = line;
      let j = i + 1;
      while (j < lines.length && !fullMethodLine.includes("{")) {
        fullMethodLine += " " + lines[j].trim();
        j++;
      }

      // 提取返回类型
      const returnTypeMatch = fullMethodLine.match(/:\s*Promise<([^>]+)>/);
      const returnType = returnTypeMatch ? returnTypeMatch[1] : undefined;

      // 根据方法签名确定参数样式和类型
      let paramStyle: "none" | "id" | "id+body" | "query" | "body" = "none";
      let paramTypes: {
        idType?: string;
        bodyType?: string;
        queryType?: string;
      } = {};

      if (fullMethodLine.includes("(") && !fullMethodLine.match(/\(\s*\)/)) {
        // 更精确的参数解析
        const hasIdParam = path.includes("/:id");
        const hasBodyParam =
          fullMethodLine.includes("@Body") ||
          (fullMethodLine.match(/\([^)]*,/g) &&
            currentDecorator.verb.toLowerCase() !== "get");
        const hasQueryParam = fullMethodLine.includes("@Query");

        // 提取参数类型信息
        const paramMatch = fullMethodLine.match(/\(([^)]+)\)/);
        if (paramMatch) {
          const params = paramMatch[1].split(",").map((p) => p.trim());

          for (const param of params) {
            if (param.includes("id:")) {
              const typeMatch = param.match(/id:\s*([^,\s]+)/);
              paramTypes.idType = typeMatch ? typeMatch[1] : "string";
            } else if (param.includes(":") && !param.includes("id:")) {
              const typeMatch = param.match(/:\s*([^,\s=?]+)/);
              if (typeMatch) {
                const type = typeMatch[1].trim();
                if (
                  hasQueryParam ||
                  currentDecorator.verb.toLowerCase() === "get"
                ) {
                  paramTypes.queryType = type;
                } else {
                  paramTypes.bodyType = type;
                }
              }
            }
          }
        }

        if (hasIdParam && hasBodyParam) {
          paramStyle = "id+body";
        } else if (hasIdParam) {
          paramStyle = "id";
        } else if (
          hasQueryParam ||
          currentDecorator.verb.toLowerCase() === "get"
        ) {
          paramStyle = "query";
        } else {
          paramStyle = "body";
        }
      }

      methodMap.set(methodName, {
        name: methodName,
        verb: currentDecorator.verb,
        path,
        paramStyle,
        description,
        paramTypes,
        returnType,
        fullSignature: fullMethodLine,
      });

      currentDecorator = null;
    }
  }

  return methodMap;
}

// 获取 API controller 文件的类体范围
export function getApiClassBodyRange(
  content: string,
  className: string
): { start: number; end: number } | null {
  const classRegex = new RegExp(
    `export\\s+default\\s+class\\s+${className}\\s*\\{`
  );
  const match = classRegex.exec(content);
  if (!match) return null;

  const startBrace = content.indexOf("{", match.index);
  if (startBrace < 0) return null;

  let i = startBrace + 1;
  let depth = 1;
  while (i < content.length && depth > 0) {
    const ch = content[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    i++;
  }

  return depth === 0 ? { start: startBrace + 1, end: i - 1 } : null;
}
