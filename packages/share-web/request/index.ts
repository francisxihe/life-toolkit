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
      // 重写
      return async function (path: string, params?: any): Promise<T> {
        console.log("Electron API调用:", method, path, params);
        const res = await electronAPI[method](path, params);
        console.log("Electron API调用:", res);
        return res as Promise<T>;
      };
    }
  }
  return {
    get,
    post,
    put,
    remove,
  }[method];
}
