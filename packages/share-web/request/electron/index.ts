/**
 * 数据适配层 - 根据运行环境选择数据源
 */

import type { ElectronAPI } from '@life-toolkit/share-types';

// 检查是否为Electron环境
export function isElectronEnvironment(): boolean {
  return (
    typeof window !== "undefined" && typeof window.electronAPI !== "undefined"
  );
}

// 获取ElectronAPI实例
export function getElectronAPI(): ElectronAPI | null {
  if (!isElectronEnvironment()) {
    return null;
  }
  
  return window.electronAPI;
}
