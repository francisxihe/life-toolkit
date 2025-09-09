/**
 * 适配层控制器辅助工具
 * 用于帮助适配层控制器使用业务控制器的装饰器信息
 */

import { getControllerMetadata, ControllerMethodMetadata } from './index';

/**
 * 获取业务控制器的方法元数据
 */
export function getBusinessControllerMethods(controllerName: string): ControllerMethodMetadata[] {
  const methodsMap = getControllerMetadata(controllerName);
  return Array.from(methodsMap.values());
}

/**
 * 根据方法名获取方法元数据
 */
export function getMethodMetadata(controllerName: string, methodName: string): ControllerMethodMetadata | undefined {
  const methodsMap = getControllerMetadata(controllerName);
  return methodsMap.get(methodName);
}

/**
 * 生成路由路径
 */
export function generateRoutePath(metadata: ControllerMethodMetadata, basePrefix: string = ''): string {
  if (metadata.path) {
    return basePrefix + metadata.path;
  }

  // 如果没有指定路径，根据方法名和HTTP方法生成默认路径
  const methodName = metadata.methodName;

  switch (metadata.httpMethod) {
    case 'GET':
      if (methodName === 'list') return basePrefix + '/list';
      if (methodName === 'page') return basePrefix + '/page';
      if (methodName.startsWith('find')) return basePrefix + '/detail/:id';
      return basePrefix + '/' + methodName;

    case 'POST':
      if (methodName === 'create') return basePrefix + '/create';
      return basePrefix + '/' + methodName;

    case 'PUT':
      if (methodName === 'update') return basePrefix + '/update/:id';
      if (methodName.includes('batch')) return basePrefix + '/' + methodName.replace(/([A-Z])/g, '-$1').toLowerCase();
      return basePrefix + '/' + methodName + '/:id';

    case 'DELETE':
      if (methodName === 'remove' || methodName === 'delete') return basePrefix + '/delete/:id';
      return basePrefix + '/' + methodName + '/:id';

    default:
      return basePrefix + '/' + methodName;
  }
}

/**
 * 检查方法是否需要ID参数
 */
export function requiresIdParam(metadata: ControllerMethodMetadata): boolean {
  const path = metadata.path || '';
  return (
    path.includes(':id') ||
    ['findById', 'update', 'remove', 'delete', 'abandon', 'restore'].includes(metadata.methodName)
  );
}

/**
 * 检查方法是否需要Body参数
 */
export function requiresBodyParam(metadata: ControllerMethodMetadata): boolean {
  return (
    metadata.httpMethod === 'POST' ||
    metadata.httpMethod === 'PUT' ||
    metadata.httpMethod === 'PATCH' ||
    ['create', 'update', 'doneBatch'].includes(metadata.methodName)
  );
}

/**
 * 检查方法是否需要Query参数
 */
export function requiresQueryParam(metadata: ControllerMethodMetadata): boolean {
  return metadata.httpMethod === 'GET' && ['list', 'page'].includes(metadata.methodName);
}
