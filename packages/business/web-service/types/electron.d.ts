/**
 * Electron API 类型声明
 * 集中管理所有 Electron 相关的类型定义
 */

export interface ElectronAPI {
  // 基础API
  getAppInfo: () => Promise<{ version: string; platform: string }>;
  loadURL: (url: string) => Promise<{ success: boolean; error?: string }>;
  setNativeThemeSource: (source: 'system' | 'light' | 'dark') => Promise<void>;
  isElectron: boolean;

  // 文件操作
  readFile?: (filePath: string) => Promise<{ success: boolean; message: string }>;

  // 事件监听（与 preload 实现一致）
  on?: (channel: string, listener: (...args: any[]) => void) => void;
  removeListener?: (channel: string, listener: (...args: any[]) => void) => void;

  // 数据库操作
  get: <T>(path: string, params?: any) => Promise<{ data: T; code: number; message: string }>;
  post: <T>(path: string, params?: any) => Promise<{ data: T; code: number; message: string }>;
  put: <T>(path: string, params?: any) => Promise<{ data: T; code: number; message: string }>;
  remove: <T>(path: string, params?: any) => Promise<{ data: T; code: number; message: string }>;
}

// 全局 Window 类型扩展
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
