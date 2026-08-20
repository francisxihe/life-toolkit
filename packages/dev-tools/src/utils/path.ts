import path from 'path';
import { ROOT, CONTROLLER_SOURCE_PATH, CONTROLLER_PROXY_TARGET_PATH, DTO_SOURCE_PATH } from '../constants';

/**
 * 获取相对于来源代码基础路径的相对路径
 */
export function getRelServerPath(absolutePath: string): string {
  return path.relative(CONTROLLER_SOURCE_PATH, absolutePath);
}

/**
 * 从来源代码控制器路径获取目标代码控制器路径
 */
export function getDesktopControllerPathFromServer(sourceControllerPath: string): string {
  const relativePath = getRelServerPath(sourceControllerPath);
  return path.join(CONTROLLER_PROXY_TARGET_PATH, relativePath);
}

/**
 * 从来源代码 DTO 路径获取 VO 路径
 */
export function getVoPathFromDto(dtoFilePath: string): string {
  // 从 apps/desktop/src/service/growth/goal/dto/goal-model.dto.ts
  // 转换为 packages/business/vo/growth/goal/goal-model.vo.ts
  const relativePath = path.relative(DTO_SOURCE_PATH, dtoFilePath);
  const parts = relativePath.split(path.sep);

  // 移除 dto 目录层级
  const dtoIndex = parts.indexOf('dto');
  if (dtoIndex !== -1) {
    parts.splice(dtoIndex, 1);
  }

  // 替换文件扩展名
  const fileName = parts[parts.length - 1].replace('.dto.ts', '.vo.ts');
  parts[parts.length - 1] = fileName;

  return path.join(ROOT, 'packages/business/vo', 'growth', ...parts);
}

/**
 * 从来源代码控制器路径获取 API 控制器路径
 */
export function getApiControllerPathFromServer(sourceControllerPath: string): string {
  // 从 apps/desktop/src/service/growth/task/task.route-controller.ts
  const relativePath = path.relative(CONTROLLER_SOURCE_PATH, sourceControllerPath);
  const parts = relativePath.split(path.sep);

  const fileName = parts[parts.length - 1].replace('.route-controller.ts', '.ts').replace('.controller.ts', '.ts');

  return path.join(ROOT, 'packages/business/web-service/controller', fileName);
}
