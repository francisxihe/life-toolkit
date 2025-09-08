import path from 'path';
import { ROOT, SERVER_BASE, DESKTOP_BASE } from '../constants';

/**
 * 获取相对于服务端基础路径的相对路径
 */
export function getRelServerPath(absolutePath: string): string {
  return path.relative(SERVER_BASE, absolutePath);
}

/**
 * 从服务端控制器路径获取桌面端控制器路径
 */
export function getDesktopControllerPathFromServer(serverControllerPath: string): string {
  const relativePath = getRelServerPath(serverControllerPath);
  return path.join(DESKTOP_BASE, relativePath);
}

/**
 * 从服务端 DTO 路径获取 VO 路径
 */
export function getVoPathFromDto(dtoFilePath: string): string {
  // 从 packages/business/server/src/growth/goal/dto/goal-model.dto.ts
  // 转换为 packages/business/vo/growth/goal/goal-model.vo.ts
  const relativePath = path.relative(SERVER_BASE, dtoFilePath);
  const parts = relativePath.split(path.sep);
  
  // 移除 dto 目录层级
  const dtoIndex = parts.indexOf('dto');
  if (dtoIndex !== -1) {
    parts.splice(dtoIndex, 1);
  }
  
  // 替换文件扩展名
  const fileName = parts[parts.length - 1].replace('.dto.ts', '.vo.ts');
  parts[parts.length - 1] = fileName;
  
  return path.join(ROOT, 'packages/business/vo', ...parts);
}

/**
 * 从服务端控制器路径获取 API 控制器路径
 */
export function getApiControllerPathFromServer(serverControllerPath: string): string {
  // 从 packages/business/server/src/growth/task/task.controller.ts
  // 转换为 packages/business/api/controller/task/task.ts
  const relativePath = path.relative(SERVER_BASE, serverControllerPath);
  const parts = relativePath.split(path.sep);

  // 移除最后的 .controller.ts 并替换为 .ts
  const fileName = parts[parts.length - 1].replace('.controller.ts', '.ts');

  return path.join(ROOT, 'packages/business/api/controller', fileName);
}
