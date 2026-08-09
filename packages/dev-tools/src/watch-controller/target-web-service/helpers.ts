import { CONTROLLER_SOURCE_ROOTS, CONTROLLER_WEB_SERVICE_TARGET_PATH } from '../../constants';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * 查找所有控制器对
 * SSOT: apps/desktop/.../*.route-controller.ts → packages/business/web-service/{module}/*.service.ts
 */
export function findAllControllerPairs(): Array<{ sourcePath: string; targetPath: string; className: string }> {
  const pairs: Array<{ sourcePath: string; targetPath: string; className: string }> = [];

  const findControllerFiles = (dir: string, basePath: string): string[] => {
    if (!existsSync(dir)) return [];
    const files: string[] = [];
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...findControllerFiles(fullPath, basePath));
      } else if (item.endsWith('.route-controller.ts')) {
        const relativePath = fullPath.replace(basePath, '').replace(/^[\\/]/, '');
        files.push(relativePath);
      }
    }

    return files;
  };

  try {
    for (const { root, module } of CONTROLLER_SOURCE_ROOTS) {
      const sourceFiles = findControllerFiles(root, root);
      for (const sourceFile of sourceFiles) {
        const sourcePath = join(root, sourceFile);
        const fileName = sourceFile.split(/[\\/]/).pop() || '';
        const serviceName = fileName.replace('.route-controller.ts', '.service.ts');
        const targetPath = join(CONTROLLER_WEB_SERVICE_TARGET_PATH, module, serviceName);
        const className = extractServiceClassNameFromPath(sourceFile);

        pairs.push({
          sourcePath,
          targetPath,
          className,
        });
      }
    }
  } catch (error) {
    console.error('查找控制器文件时出错:', error);
  }

  return pairs;
}

/**
 * 从文件路径提取 Service 类名
 */
export function extractServiceClassNameFromPath(relativePath: string): string {
  const fileName = relativePath.split(/[\\/]/).pop() || '';
  const baseName = fileName.replace('.route-controller.ts', '');
  return (
    baseName
      .split(/[-_]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') + 'Service'
  );
}
