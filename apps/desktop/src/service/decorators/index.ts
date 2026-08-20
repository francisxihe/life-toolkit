/**
 * 业务控制器装饰器系统
 * - 运行时：桥接 electron-ipc-restful，使 route-controller 可直接注册为 IPC 路由
 * - 静态元数据：保留 description 等供文档 / 自省使用
 */

import {
  Controller as IpcController,
  Get as IpcGet,
  Post as IpcPost,
  Put as IpcPut,
  Delete as IpcDelete,
  Body as IpcBody,
  Param as IpcParam,
  Query as IpcQuery,
} from 'electron-ipc-restful';

export interface ControllerMethodMetadata {
  /** 方法名称 */
  methodName: string;
  /** HTTP 方法类型 */
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
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
const CONTROLLER_METADATA = new Map<string, Map<string, ControllerMethodMetadata>>();

/**
 * 获取控制器的所有方法元数据
 */
export function getControllerMetadata(controllerName: string): Map<string, ControllerMethodMetadata> {
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
export function BusinessMethod(options: Partial<ControllerMethodMetadata> = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const controllerName = target.constructor.name;
    const metadata: ControllerMethodMetadata = {
      methodName: propertyKey,
      ...options,
    };

    setControllerMethodMetadata(controllerName, propertyKey, metadata);

    return descriptor;
  };
}

type MethodOptions = { description?: string };

function createBridgedMethodDecorator(
  httpMethod: ControllerMethodMetadata['httpMethod'],
  ipcDecorator: (path?: string) => MethodDecorator
) {
  return (path?: string, options?: MethodOptions) => {
    const ipc = ipcDecorator(path ?? '');
    const biz = BusinessMethod({
      httpMethod,
      path,
      ...options,
    });
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      ipc(target, propertyKey, descriptor);
      return biz(target, propertyKey, descriptor);
    };
  };
}

/**
 * HTTP GET 方法装饰器
 */
export const Get = createBridgedMethodDecorator('GET', IpcGet);

/**
 * HTTP POST 方法装饰器
 */
export const Post = createBridgedMethodDecorator('POST', IpcPost);

/**
 * HTTP PUT 方法装饰器
 */
export const Put = createBridgedMethodDecorator('PUT', IpcPut);

/**
 * HTTP DELETE 方法装饰器
 */
export const Delete = createBridgedMethodDecorator('DELETE', IpcDelete);

/**
 * HTTP PATCH 方法装饰器（仅业务元数据；electron-ipc-restful 暂无 PATCH）
 */
export function Patch(path?: string, options?: MethodOptions) {
  return BusinessMethod({
    httpMethod: 'PATCH',
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
 * 用于标记业务控制器类，并注册 IPC 路由前缀
 */
export function Controller(path?: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    IpcController(path)(constructor);

    // 存储控制器路径元数据（供本地工具使用）
    if (path) {
      Reflect.defineMetadata('controller:path', path, constructor);
    }

    // 标记为控制器类
    Reflect.defineMetadata('controller:isController', true, constructor);

    return constructor;
  };
}

/**
 * 请求体参数装饰器
 */
export function Body(name?: string) {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
    IpcBody(name)(target, propertyKey, parameterIndex);

    const existingBodyParams = Reflect.getMetadata('method:bodyParams', target, propertyKey!) || [];
    existingBodyParams.push(parameterIndex);
    Reflect.defineMetadata('method:bodyParams', existingBodyParams, target, propertyKey!);
  };
}

/**
 * 路径参数装饰器
 */
export function Param(name?: string) {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
    IpcParam(name)(target, propertyKey, parameterIndex);

    const existingPathParams = Reflect.getMetadata('method:pathParams', target, propertyKey!) || [];
    existingPathParams.push({ index: parameterIndex, name });
    Reflect.defineMetadata('method:pathParams', existingPathParams, target, propertyKey!);
  };
}

/**
 * 查询参数装饰器
 */
export function Query(name?: string) {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
    IpcQuery(name)(target, propertyKey, parameterIndex);

    const existingQueryParams = Reflect.getMetadata('method:queryParams', target, propertyKey!) || [];
    existingQueryParams.push({ index: parameterIndex, name });
    Reflect.defineMetadata('method:queryParams', existingQueryParams, target, propertyKey!);
  };
}

// 导出适配器辅助工具
export * from './adapter-helper';
