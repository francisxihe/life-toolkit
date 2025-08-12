import { ElectronAPI } from "@life-toolkit/share-types";
import { getElectronAPI, isElectronEnvironment } from "./electron";
export * from "./server";

export { getElectronAPI };

/**
 * 适配器装饰器 - 简化控制器方法的适配逻辑
 */
export function request<T>({
  httpOperation,
  electronOperation,
}: {
  httpOperation: () => Promise<T>;
  electronOperation: (electronAPI: ElectronAPI) => Promise<T>;
}): Promise<T> {
  if (isElectronEnvironment()) {
    return electronOperation(window.electronAPI);
  }
  return httpOperation();
}