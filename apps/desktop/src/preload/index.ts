// 导入模块
const { contextBridge, ipcRenderer } = require("electron");
import type { ElectronAPI } from "@life-toolkit/share-types";

// 检查当前环境是否为Electron
const isElectron = () => {
  // 确认全局window对象存在
  if (typeof window === "undefined") return false;

  // 检查process对象是否存在且类型为object
  if (typeof process !== "object") return false;

  // 尝试访问process.versions.electron，如果存在说明在Electron环境中
  return (
    Object.prototype.hasOwnProperty.call(process, "versions") &&
    !!process.versions &&
    !!process.versions.electron
  );
};

console.log("============预加载脚本初始化");

// 暴露API函数
const exposeAPI = () => {
  if (isElectron()) {
    console.log("============在Electron环境中运行");
    contextBridge.exposeInMainWorld("electronAPI", {
      getAppInfo: () => ipcRenderer.invoke("get-app-info"),
      loadURL: (url: string) => ipcRenderer.invoke("load-url", url),
      isElectron: true,

      get: (path: string, params: any) => ipcRenderer.invoke(path, params),
      post: (path: string, params: any) => ipcRenderer.invoke(path, params),
      put: (path: string, params: any) => ipcRenderer.invoke(path, params),
      remove: (path: string, params: any) => ipcRenderer.invoke(path, params),

      // 文件操作相关 API
      readFile: (filePath: string) => ipcRenderer.invoke("read-file", filePath),

      // 事件监听相关 API
      on: (channel: string, listener: (...args: any[]) => void) => {
        ipcRenderer.on(channel, listener);
      },
      removeListener: (channel: string, listener: (...args: any[]) => void) => {
        ipcRenderer.removeListener(channel, listener);
      },
    } as ElectronAPI);
  } else {
    console.log("============在Web环境中运行");
    if (typeof window !== "undefined") {
      (window as any).electronAPI = {
        getAppInfo: () =>
          Promise.resolve({ version: "web", platform: "browser" }),
        readFile: () =>
          Promise.resolve({
            success: false,
            message: "在Web环境中不支持文件系统操作",
          }),
        on: () => false,
        removeListener: () => false,
        isElectron: false,
      };
    }
  }
};

// 立即执行暴露API
exposeAPI();
