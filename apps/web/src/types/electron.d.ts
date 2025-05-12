/**
 * Electron API 类型声明
 */
interface ElectronAPI {
  getAppInfo: () => Promise<{ version: string, platform: string }>;
  readFile: (filePath: string) => Promise<{ success: boolean, message: string }>;
  on: (channel: string, callback: (data: any) => void) => boolean;
  removeListener: (channel: string) => boolean;
}

declare interface Window {
  electronAPI: ElectronAPI;
} 