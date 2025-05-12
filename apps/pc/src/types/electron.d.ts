// 为electron模块提供类型声明
// declare module 'electron' {
//   import electron from 'electron';
//   export default electron;
// }

// // 添加Electron命名空间
// declare namespace Electron {
//   interface BrowserWindow {}
// }

// 声明全局Window类型
interface Window {
  electronAPI: {
    getAppInfo: () => Promise<{ version: string; platform: string }>;
    loadURL: (url: string) => Promise<{ success: boolean; error?: string }>;
    isElectron: boolean;
  };
} 