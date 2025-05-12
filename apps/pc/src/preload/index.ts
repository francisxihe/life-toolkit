/**
 * 预加载脚本入口文件
 * 使用CommonJS语法，因为预加载脚本输出为cjs格式
 */

// 导入模块
const { contextBridge, ipcRenderer } = require('electron');

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
    });
  } else {
    console.log("============在Web环境中运行");
    if (typeof window !== "undefined") {
      (window as any).electronAPI = {
        getAppInfo: () => Promise.resolve({ version: "web", platform: "browser" }),
        readFile: () => Promise.resolve({ success: false, message: "在Web环境中不支持文件系统操作" }),
        on: () => false,
        removeListener: () => false,
        isElectron: false,
      };
    }
  }
};

// 立即执行暴露API
exposeAPI();