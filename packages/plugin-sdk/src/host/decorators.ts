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
  methodName: string;
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path?: string;
  description?: string;
  requireAuth?: boolean;
  paramTypes?: unknown[];
  returnType?: unknown;
}

const CONTROLLER_METADATA = new Map<string, Map<string, ControllerMethodMetadata>>();

export function getControllerMetadata(controllerName: string): Map<string, ControllerMethodMetadata> {
  return CONTROLLER_METADATA.get(controllerName) || new Map();
}

export function setControllerMethodMetadata(
  controllerName: string,
  methodName: string,
  metadata: ControllerMethodMetadata,
) {
  if (!CONTROLLER_METADATA.has(controllerName)) {
    CONTROLLER_METADATA.set(controllerName, new Map());
  }
  CONTROLLER_METADATA.get(controllerName)!.set(methodName, metadata);
}

export function BusinessMethod(options: Partial<ControllerMethodMetadata> = {}) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    setControllerMethodMetadata(target.constructor.name, propertyKey, {
      methodName: propertyKey,
      ...options,
    });
    return descriptor;
  };
}

type MethodOptions = { description?: string };

function bridgedDecorator(
  httpMethod: ControllerMethodMetadata['httpMethod'],
  ipcDecorator: (path?: string) => MethodDecorator,
) {
  return (path?: string, options?: MethodOptions) => {
    const ipc = ipcDecorator(path ?? '');
    const biz = BusinessMethod({
      httpMethod,
      path,
      ...options,
    });
    return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
      ipc(target, propertyKey, descriptor);
      return biz(target, propertyKey, descriptor);
    };
  };
}

export const Get = bridgedDecorator('GET', IpcGet);
export const Post = bridgedDecorator('POST', IpcPost);
export const Put = bridgedDecorator('PUT', IpcPut);
export const Delete = bridgedDecorator('DELETE', IpcDelete);

export function Patch(path?: string, options?: MethodOptions) {
  return BusinessMethod({
    httpMethod: 'PATCH',
    path,
    ...options,
  });
}

export function RequireAuth() {
  return BusinessMethod({ requireAuth: true });
}

export function Controller(path?: string) {
  return function <T extends { new (...args: unknown[]): object }>(constructor: T) {
    IpcController(path)(constructor);
    if (path) Reflect.defineMetadata('controller:path', path, constructor);
    Reflect.defineMetadata('controller:isController', true, constructor);
    return constructor;
  };
}

export function Body(name?: string) {
  return function (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) {
    IpcBody(name)(target, propertyKey, parameterIndex);
  };
}

export function Param(name?: string) {
  return function (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) {
    IpcParam(name)(target, propertyKey, parameterIndex);
  };
}

export function Query(name?: string) {
  return function (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) {
    IpcQuery(name)(target, propertyKey, parameterIndex);
  };
}
