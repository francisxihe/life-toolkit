/**
 * Electron API 访问辅助工具
 * 用于安全地检测并调用 Electron API，如果不在 Electron 环境中，则提供退路方案
 */

// 检查是否在Electron环境中
export const isElectronEnv = (): boolean => {
  // 检查window.electronAPI是否存在
  return typeof window !== 'undefined' && 'electronAPI' in window;
};

// 获取应用信息
export const getAppInfo = async (): Promise<{ version: string; platform: string }> => {
  if (isElectronEnv()) {
    return await window.electronAPI.getAppInfo();
  }
  return { version: 'web', platform: 'browser' };
};

// 读取文件
export interface FileResult {
  success: boolean;
  message: string;
}

export const readFile = async (filePath: string): Promise<FileResult> => {
  if (isElectronEnv()) {
    return await window.electronAPI.readFile(filePath);
  }
  return { success: false, message: '在Web环境中不支持文件系统操作' };
};

// 事件监听辅助函数
export type EventCallback = (data: any) => void;

export const listenToEvent = (channel: string, callback: EventCallback): boolean => {
  if (isElectronEnv()) {
    return window.electronAPI.on(channel, callback);
  }
  console.log(`在Web环境中不支持Electron事件: ${channel}`);
  return false;
};

export const removeEventListener = (channel: string): boolean => {
  if (isElectronEnv()) {
    return window.electronAPI.removeListener(channel);
  }
  return false;
};

// 导出统一的API
const electronBridge = {
  isElectronEnv,
  getAppInfo,
  readFile,
  listenToEvent,
  removeEventListener
};

export default electronBridge; 