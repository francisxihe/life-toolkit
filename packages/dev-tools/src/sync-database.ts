import { log } from "./utils";
import {
  parseDesktopMethodNames,
  getClassBodyRange,
  collectAllMethodNames,
  getMethodOccurrences,
  getServerMethodDecorators,
  type MethodDecoratorInfo,
} from "./parser";

export function ensureConstructorArgs(
  content: string,
  className: string,
  serviceConstNames: string[]
): string {
  const baseName = className.replace(/Controller$/, "");
  const callRe = new RegExp(
    `new\\s+_${baseName}Controller\\s*\\(([^)]*)\\)`,
    "ms"
  );
  if (!callRe.test(content)) return content;
  return content.replace(
    callRe,
    `new _${baseName}Controller(${serviceConstNames.join(", ")})`
  );
}

export function genMethodWrapper(
  decoratorInfo: MethodDecoratorInfo,
  options: { includeDescription?: boolean } = {}
): string {
  const {
    name,
    verb,
    path: p,
    paramStyle,
    description,
    paramTypes,
    returnType,
  } = decoratorInfo;
  const { includeDescription = false } = options;
  const indent = "  ";
  const lines: string[] = [];

  // 生成装饰器（默认不包含描述）
  if (includeDescription && description) {
    lines.push(`${indent}@${verb}("${p}", { description: "${description}" })`);
  } else {
    lines.push(`${indent}@${verb}("${p}")`);
  }

  switch (paramStyle) {
    case "none":
      lines.push(`${indent}async ${name}() {`);
      lines.push(`${indent}  return this.controller.${name}();`);
      lines.push(`${indent}}`);
      break;
    case "id":
      lines.push(`${indent}async ${name}(@Param("id") id: ${paramTypes?.idType || "string"}) {`);
      lines.push(`${indent}  return this.controller.${name}(id);`);
      lines.push(`${indent}}`);
      break;
    case "id+body":
      lines.push(
        `${indent}async ${name}(@Param("id") id: string, @Body() body: ${paramTypes?.bodyType || "any"}) {`
      );
      lines.push(`${indent}  return this.controller.${name}(id, body);`);
      lines.push(`${indent}}`);
      break;
    case "query":
      lines.push(`${indent}async ${name}(@Query() query?: ${paramTypes?.queryType || "any"}) {`);
      lines.push(`${indent}  return this.controller.${name}(query);`);
      lines.push(`${indent}}`);
      break;
    case "body":
      lines.push(`${indent}async ${name}(@Body() body: ${paramTypes?.bodyType || "any"}) {`);
      lines.push(`${indent}  return this.controller.${name}(body);`);
      lines.push(`${indent}}`);
      break;
  }
  return lines.join("\n");
}

export function removeExtraGeneratedMethods(
  desktopContent: string,
  className: string,
  serverMethodSet: Set<string>
): string {
  const range = getClassBodyRange(desktopContent, className);
  if (!range) return desktopContent;
  let body = desktopContent.slice(range.start, range.end);
  const head = desktopContent.slice(0, range.start);
  const tail = desktopContent.slice(range.end);

  const nameSet = collectAllMethodNames(body);
  try {
    log("Collected method names:", className, Array.from(nameSet));
  } catch {}

  for (const name of nameSet) {
    if (name === "constructor") continue;
    if (!serverMethodSet.has(name)) {
      const occ = getMethodOccurrences(body, name);
      if (occ.length) {
        try {
          log("Removing non-server method:", className, name, "x", occ.length);
        } catch {}
        occ
          .sort((a, b) => b.start - a.start)
          .forEach(({ start, end }) => {
            body = body.slice(0, start) + body.slice(end);
          });
      }
    }
  }

  for (const name of nameSet) {
    if (name === "constructor") continue;
    if (!serverMethodSet.has(name)) continue;
    const occ = getMethodOccurrences(body, name);
    if (occ.length > 1) {
      try {
        log(
          "Removing duplicate methods:",
          className,
          name,
          "remove",
          occ.length - 1
        );
      } catch {}
      occ
        .slice(1)
        .sort((a, b) => b.start - a.start)
        .forEach(({ start, end }) => {
          body = body.slice(0, start) + body.slice(end);
        });
    }
  }

  return head + body + tail;
}

export function syncMissingMethods(
  desktopContent: string,
  className: string,
  serverContent: string
): string {
  const serverMethodDecorators = getServerMethodDecorators(
    serverContent,
    className
  );
  const serverMethods = Array.from(serverMethodDecorators.keys());
  try {
    log("Server methods parsed for", className, serverMethods);
  } catch {}

  let next = removeExtraGeneratedMethods(
    desktopContent,
    className,
    new Set(serverMethods)
  );

  const existing = parseDesktopMethodNames(next, className);
  const missing = serverMethods.filter((n) => !existing.has(n));
  if (missing.length === 0) return next;

  const range = getClassBodyRange(next, className);
  if (!range) return next;
  const before = next.slice(0, range.end);
  const after = next.slice(range.end);

  // 使用装饰器信息生成方法（默认不包含描述）
  const missingDecorators = missing
    .map((name) => serverMethodDecorators.get(name)!)
    .filter(Boolean);
  const insertion =
    "\n" +
    missingDecorators.map((info) => genMethodWrapper(info)).join("\n\n") +
    "\n";
  return before + insertion + after;
}
