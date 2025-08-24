import { getElectronAPI, isElectronEnvironment } from "./electron";
import { get, post, put, remove } from "./server";

/**
 * 适配器装饰器 - 简化控制器方法的适配逻辑
 */
export function request<T>({
  method,
}: {
  method: "put" | "post" | "get" | "remove";
}): (path: string, params?: Record<string, any>) => Promise<T> {
  if (isElectronEnvironment()) {
    const electronAPI = getElectronAPI();
    if (electronAPI) {
      // 重写
      return async function (
        path: string,
        params?: Record<string, any>
      ): Promise<T> {
        console.log("Electron API调用:", method, path, params);
        try {
          const res = await electronAPI[method](path, params);
          console.log("Electron API返回:", res);
          return res as Promise<T>;
        } catch (error) {
          console.error("Electron API调用失败:", error);
          throw error;
        }
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
