/**
 * Electron API 类型声明
 * 集中管理所有Electron相关的类型定义
 */

export interface ElectronAPI {
  // 基础API
  getAppInfo: () => Promise<{ version: string; platform: string }>;
  loadURL: (url: string) => Promise<{ success: boolean; error?: string }>;
  isElectron: boolean;

  // 文件操作
  readFile?: (filePath: string) => Promise<{ success: boolean; message: string }>;

  // 事件监听
  on?: (channel: string, callback: (data: any) => void) => boolean;
  removeListener?: (channel: string) => boolean;

  // 数据库操作
  get: <T>(path: string, params?: any) => Promise<{ data: T; code: number; message: string }>;
  post: <T>(path: string, params?: any) => Promise<{ data: T; code: number; message: string }>;
  put: <T>(path: string, params?: any) => Promise<{ data: T; code: number; message: string }>;
  remove: <T>(path: string, params?: any) => Promise<{ data: T; code: number; message: string }>;
}

// 全局Window类型扩展
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
