/**
 * 业务控制器装饰器系统
 * 用于标记和管理业务控制器方法的元数据
 */

export interface ControllerMethodMetadata {
  /** 方法名称 */
  methodName: string;
  /** HTTP 方法类型 */
  httpMethod?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  /** 路由路径 */
  path?: string;
  /** 方法描述 */
  description?: string;
  /** 是否需要认证 */
  requireAuth?: boolean;
  /** 参数类型信息 */
  paramTypes?: any[];
  /** 返回类型信息 */
  returnType?: any;
}

// 存储控制器方法元数据的 Map
const CONTROLLER_METADATA = new Map<
  string,
  Map<string, ControllerMethodMetadata>
>();

/**
 * 获取控制器的所有方法元数据
 */
export function getControllerMetadata(
  controllerName: string
): Map<string, ControllerMethodMetadata> {
  return CONTROLLER_METADATA.get(controllerName) || new Map();
}

/**
 * 设置控制器方法元数据
 */
export function setControllerMethodMetadata(
  controllerName: string,
  methodName: string,
  metadata: ControllerMethodMetadata
) {
  if (!CONTROLLER_METADATA.has(controllerName)) {
    CONTROLLER_METADATA.set(controllerName, new Map());
  }
  const controllerMethods = CONTROLLER_METADATA.get(controllerName)!;
  controllerMethods.set(methodName, metadata);
}

/**
 * 业务方法装饰器
 * 用于标记业务控制器中的方法
 */
export function BusinessMethod(
  options: Partial<ControllerMethodMetadata> = {}
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const controllerName = target.constructor.name;
    const metadata: ControllerMethodMetadata = {
      methodName: propertyKey,
      ...options,
    };

    setControllerMethodMetadata(controllerName, propertyKey, metadata);

    return descriptor;
  };
}

/**
 * HTTP GET 方法装饰器
 */
export function Get(path?: string, options?: { description?: string }) {
  return BusinessMethod({
    httpMethod: "GET",
    path,
    ...options,
  });
}

/**
 * HTTP POST 方法装饰器
 */
export function Post(path?: string, options?: { description?: string }) {
  return BusinessMethod({
    httpMethod: "POST",
    path,
    ...options,
  });
}

/**
 * HTTP PUT 方法装饰器
 */
export function Put(path?: string, options?: { description?: string }) {
  return BusinessMethod({
    httpMethod: "PUT",
    path,
    ...options,
  });
}

/**
 * HTTP DELETE 方法装饰器
 */
export function Delete(path?: string, options?: { description?: string }) {
  return BusinessMethod({
    httpMethod: "DELETE",
    path,
    ...options,
  });
}

/**
 * HTTP PATCH 方法装饰器
 */
export function Patch(path?: string, options?: { description?: string }) {
  return BusinessMethod({
    httpMethod: "PATCH",
    path,
    ...options,
  });
}

/**
 * 需要认证的方法装饰器
 */
export function RequireAuth() {
  return BusinessMethod({
    requireAuth: true,
  });
}

/**
 * 控制器类装饰器
 * 用于标记业务控制器类
 */
export function Controller(path?: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    // 存储控制器路径元数据
    if (path) {
      Reflect.defineMetadata('controller:path', path, constructor);
    }
    
    // 标记为控制器类
    Reflect.defineMetadata('controller:isController', true, constructor);
    
    return constructor;
  };
}

// 导出适配器辅助工具
export * from "./adapter-helper";
