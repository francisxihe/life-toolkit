import { getElectronAPI, isElectronEnvironment } from './electron';
import { get, post, put, remove } from './server';

/**
 * 适配器装饰器
 */
export function request<T>({
  method,
}: {
  method: 'put' | 'post' | 'get' | 'remove';
}): (path: string, params?: Record<string, any>) => Promise<T> {
  if (isElectronEnvironment()) {
    const electronAPI = getElectronAPI();
    if (electronAPI) {
      // 重写
      return async function (path: string, params?: Record<string, any>): Promise<T> {
        try {
          const res = await electronAPI[method](path, params);
          if (res.code !== 200) {
            throw new Error(res.message);
          }
          return res.data as Promise<T>;
        } catch (error) {
          console.error('Electron API调用失败:', error);
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
