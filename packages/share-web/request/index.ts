import { ElectronAPI } from "@life-toolkit/share-types";
import { getElectronAPI, isElectronEnvironment } from "./electron";
import { get, post, put, remove } from "./server";

/**
 * 适配器装饰器 - 简化控制器方法的适配逻辑
 */
export function request<T>({
  method,
}: {
  method: "put" | "post" | "get" | "remove";
}): (path: string, params?: any) => Promise<T> {
  if (isElectronEnvironment()) {
    const electronAPI = getElectronAPI();
    if (electronAPI) {
      return electronAPI[method];
    }
  }
  return {
    get,
    post,
    put,
    remove,
  }[method];
}
