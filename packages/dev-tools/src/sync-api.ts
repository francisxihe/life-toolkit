import { log } from './utils';
import {
  parseApiMethodNames,
  getApiClassBodyRange,
  getServerMethodDecorators,
  getMethodOccurrences,
  type MethodDecoratorInfo,
} from './parser';
import {
  getServerMethodDecorators as getServerMethodDecoratorsAST,
  parseControllerInfo,
} from './parser-ast';

// 生成 API 方法
export function genApiMethodWrapper(decoratorInfo: MethodDecoratorInfo, entityName: string, basePath?: string): string {
  const { name, verb, path, paramStyle, paramTypes, returnType } = decoratorInfo;
  const indent = '  ';
  const lines: string[] = [];
  
  // 生成方法名 - 基于实际方法信息
  const methodName = generateApiMethodName(name, entityName, verb, path);
  
  // 合并Controller基础路径和方法路径
  const fullPath = basePath ? `${basePath}${path}` : path;
  
  // 生成方法签名
  let signature = `${indent}static async ${methodName}(`;
  let requestCall = `request`;
  let pathStr = fullPath;
  let bodyParam = '';
  
  // 根据参数样式生成不同的方法签名和请求调用
  const httpMethod = verb.toLowerCase() === 'delete' ? 'remove' : verb.toLowerCase();
  
  // 生成具体的类型注解
  const entityCap = entityName.charAt(0).toUpperCase() + entityName.slice(1);
  
  // 使用从server controller提取的返回类型
  const genericType = returnType ? `<${returnType}>` : '';
  
  switch (paramStyle) {
    case 'none':
      signature += ') {';
      requestCall += `${genericType}({ method: "${httpMethod}" })`;
      break;
    case 'id':
      const idType = paramTypes?.idType || 'string';
      signature += `id: ${idType}) {`;
      pathStr = pathStr.replace('/:id', '/${id}');
      requestCall += `${genericType}({ method: "${httpMethod}" })`;
      break;
    case 'id+body':
      const idType2 = paramTypes?.idType || 'string';
      const bodyType = paramTypes?.bodyType || getDefaultBodyType(name, entityCap);
      signature += `id: ${idType2}, body: ${bodyType}) {`;
      pathStr = pathStr.replace('/:id', '/${id}');
      requestCall += `${genericType}({ method: "${httpMethod}" })`;
      bodyParam = ', body';
      break;
    case 'query':
      const queryType = paramTypes?.queryType || getDefaultQueryType(name, entityCap);
      signature += `params: ${queryType}) {`;
      requestCall += `${genericType}({ method: "${httpMethod}" })`;
      bodyParam = ', params';
      break;
    case 'body':
      const bodyType2 = paramTypes?.bodyType || getDefaultBodyType(name, entityCap);
      signature += `body: ${bodyType2}) {`;
      requestCall += `${genericType}({ method: "${httpMethod}" })`;
      bodyParam = ', body';
      break;
  }
  
  lines.push(signature);
  lines.push(`${indent}  return ${requestCall}(\`${pathStr}\`${bodyParam});`);
  lines.push(`${indent}}`);
  
  return lines.join('\n');
}


// 根据方法名和实体名生成默认的 body 类型
function getDefaultBodyType(methodName: string, entityCap: string): string {
  switch (methodName) {
    case 'create':
      return `${entityCap}Vo.Create${entityCap}Vo`;
    case 'update':
      return `${entityCap}Vo.Update${entityCap}Vo`;
    case 'batchDone':
      return '{ idList?: string[] }';
    default:
      return 'any';
  }
}

// 根据方法名和实体名生成默认的 query 类型
function getDefaultQueryType(methodName: string, entityCap: string): string {
  switch (methodName) {
    case 'page':
      return `${entityCap}PageFiltersVo`;
    case 'list':
      return `${entityCap}ListFiltersVo`;
    default:
      return 'any';
  }
}

// 基于实际方法信息生成 API 方法名
function generateApiMethodName(serverMethodName: string, entityName: string, verb: string, path: string): string {
  const entityCap = entityName.charAt(0).toUpperCase() + entityName.slice(1);
  const verbLower = verb.toLowerCase();
  
  // 从路径中提取操作类型，处理带连字符的路径
  const pathParts = path.split('/').filter(part => part && !part.startsWith(':'));
  const operation = pathParts[pathParts.length - 1] || '';
  
  // 将连字符转换为驼峰命名
  const toCamelCase = (str: string) => {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  };
  
  switch (verbLower) {
    case 'post':
      if (operation === 'create' || path.endsWith('/create')) {
        return `create${entityCap}`;
      }
      if (operation) {
        const camelOperation = toCamelCase(operation);
        return `${camelOperation}${entityCap}`;
      }
      return `${serverMethodName}${entityCap}`;
    
    case 'get':
      if (path.includes('/:id') && !operation) {
        return `get${entityCap}Detail`;
      }
      if (operation === 'page') {
        return `get${entityCap}Page`;
      }
      if (operation === 'list') {
        return `get${entityCap}List`;
      }
      if (operation) {
        const camelOperation = toCamelCase(operation);
        return `get${entityCap}${camelOperation.charAt(0).toUpperCase() + camelOperation.slice(1)}`;
      }
      return `get${entityCap}${serverMethodName.charAt(0).toUpperCase() + serverMethodName.slice(1)}`;
    
    case 'put':
      if (path.includes('/:id') && !operation) {
        return `update${entityCap}`;
      }
      if (operation) {
        const camelOperation = toCamelCase(operation);
        return `${camelOperation}${entityCap}`;
      }
      return `${serverMethodName}${entityCap}`;
    
    case 'delete':
      return `delete${entityCap}`;
    
    default:
      return `${serverMethodName}${entityCap}`;
  }
}

// 移除所有生成的方法，保留手动编写的方法
function removeAllGeneratedApiMethods(
  apiContent: string,
  className: string,
  serverMethods: string[],
  entityName: string,
  serverMethodDecorators: Map<string, MethodDecoratorInfo>,
): string {
  const range = getApiClassBodyRange(apiContent, className);
  if (!range) return apiContent;
  
  let body = apiContent.slice(range.start, range.end);
  const head = apiContent.slice(0, range.start);
  const tail = apiContent.slice(range.end);

  // 生成所有可能的 API 方法名
  const allPossibleApiMethodNames = serverMethods.map(serverMethod => {
    const decoratorInfo = serverMethodDecorators.get(serverMethod);
    if (!decoratorInfo) return `${serverMethod}${entityName}`;
    return generateApiMethodName(serverMethod, entityName, decoratorInfo.verb, decoratorInfo.path);
  });

  // 移除所有可能的生成方法
  for (const methodName of allPossibleApiMethodNames) {
    const occ = getMethodOccurrences(body, methodName);
    if (occ.length > 0) {
      try { log('Removing existing API method:', className, methodName, 'x', occ.length); } catch {}
      occ.sort((a, b) => b.start - a.start).forEach(({ start, end }) => {
        body = body.slice(0, start) + body.slice(end);
      });
    }
  }

  return head + body + tail;
}

// 同步 API controller 方法（增量同步，保留手动编写的方法）
export function syncApiMethods(
  apiContent: string,
  className: string,
  serverContent: string,
  serverClassName: string,
): string {
  // 使用新的Controller信息解析
  const controllerInfo = parseControllerInfo(serverContent, serverClassName);
  if (!controllerInfo) {
    // 回退到原有方法
    const serverMethodDecorators = getServerMethodDecoratorsAST(serverContent, serverClassName);
    const serverMethods = Array.from(serverMethodDecorators.keys());
    if (serverMethods.length === 0) return apiContent;
    
    const entityName = className.replace('Controller', '');
    const existing = parseApiMethodNames(apiContent, className);
    const missing = serverMethods.filter(serverMethod => {
      return !Array.from(existing).some((existingMethod: string) => existingMethod.includes(serverMethod));
    });
    
    if (missing.length === 0) return apiContent;
    
    const range = getApiClassBodyRange(apiContent, className);
    if (!range) return apiContent;
    
    const head = apiContent.slice(0, range.end);
    const tail = apiContent.slice(range.end);
    
    const missingMethods = missing.map(methodName => {
      const decoratorInfo = serverMethodDecorators.get(methodName);
      return decoratorInfo ? genApiMethodWrapper(decoratorInfo, entityName) : '';
    }).filter(Boolean);
    
    const body = missingMethods.length > 0 ? '\n' + missingMethods.join('\n\n') + '\n' : '';
    return head + body + tail;
  }

  const serverMethods = Array.from(controllerInfo.methods.keys());
  
  if (serverMethods.length === 0) return apiContent;
  
  const entityName = className.replace('Controller', '');
  
  // 获取现有的 API 方法
  const existing = parseApiMethodNames(apiContent, className);
  
  // 找出缺失的方法
  const missing = serverMethods.filter(serverMethod => {
    const decoratorInfo = controllerInfo.methods.get(serverMethod);
    if (!decoratorInfo) return false;
    const expectedApiMethodName = generateApiMethodName(serverMethod, entityName, decoratorInfo.verb, decoratorInfo.path);
    return !existing.has(expectedApiMethodName);
  });
  
  if (missing.length === 0) return apiContent;
  
  // 获取类体范围
  const range = getApiClassBodyRange(apiContent, className);
  if (!range) return apiContent;
  
  const before = apiContent.slice(0, range.end);
  const after = apiContent.slice(range.end);
  
  // 生成缺失的方法（使用Controller基础路径）
  const newMethods = missing
    .map(serverMethod => {
      const decoratorInfo = controllerInfo.methods.get(serverMethod);
      if (!decoratorInfo) return null;
      
      const expectedApiMethodName = generateApiMethodName(serverMethod, entityName, decoratorInfo.verb, decoratorInfo.path);
      try { log('Synced API method:', className, expectedApiMethodName); } catch {}
      
      return genApiMethodWrapper(decoratorInfo, entityName, controllerInfo.basePath);
    })
    .filter(Boolean);
  
  if (newMethods.length === 0) return apiContent;
  
  // 增量添加新方法
  const insertion = '\n' + newMethods.join('\n\n') + '\n';
  
  return before + insertion + after;
}
