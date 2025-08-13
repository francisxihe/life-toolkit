
// 导入模块
const { contextBridge, ipcRenderer } = require('electron');
import type {ElectronAPI} from '@life-toolkit/share-types';

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
      
      // 数据库相关 API
      database: {
        user: {
          create: (userData: any) => ipcRenderer.invoke('user:create', userData),
          findAll: () => ipcRenderer.invoke('user:findAll'),
          findOne: (id: string) => ipcRenderer.invoke('user:findById', id),
          update: (id: string, data: any) => ipcRenderer.invoke('user:update', id, data),
          remove: (id: string) => ipcRenderer.invoke('user:delete', id),
        },

        goal: {
          create: (goalData: any) => ipcRenderer.invoke('goal:create', goalData),
          page: (filter: any) => ipcRenderer.invoke('goal:page', filter),
          list: (filter: any) => ipcRenderer.invoke('goal:list', filter),
          getTree: (filter: any) => ipcRenderer.invoke('goal:getTree', filter),
          findDetail: (id: string) => ipcRenderer.invoke('goal:findDetail', id),
          update: (id: string, data: any) => ipcRenderer.invoke('goal:update', id, data),
          delete: (id: string) => ipcRenderer.invoke('goal:delete', id),
          batchDone: (params: { idList: string[] }) => ipcRenderer.invoke('goal:batchDone', params),
          abandon: (id: string) => ipcRenderer.invoke('goal:abandon', id),
          restore: (id: string) => ipcRenderer.invoke('goal:restore', id),
        },

        task: {
          create: (taskData: any) => ipcRenderer.invoke('task:create', taskData),
          page: (filter: any) => ipcRenderer.invoke('task:page', filter),
          list: (filter: any) => ipcRenderer.invoke('task:list', filter),
          findById: (id: string) => ipcRenderer.invoke('task:findById', id),
          taskWithTrackTime: (id: string) => ipcRenderer.invoke('task:taskWithTrackTime', id),
          update: (id: string, data: any) => ipcRenderer.invoke('task:update', id, data),
          delete: (id: string) => ipcRenderer.invoke('task:delete', id),
          batchDone: (params: { idList: string[] }) => ipcRenderer.invoke('task:batchDone', params),
          abandon: (id: string) => ipcRenderer.invoke('task:abandon', id),
          restore: (id: string) => ipcRenderer.invoke('task:restore', id),
        },

        todo: {
          create: (todoData: any) => ipcRenderer.invoke('todo:create', todoData),
          page: (filter: any) => ipcRenderer.invoke('todo:page', filter),
          list: (filter: any) => ipcRenderer.invoke('todo:list', filter),
          findById: (id: string) => ipcRenderer.invoke('todo:findById', id),
          update: (id: string, data: any) => ipcRenderer.invoke('todo:update', id, data),
          delete: (id: string) => ipcRenderer.invoke('todo:delete', id),
          batchDone: (params: { idList: string[] }) => ipcRenderer.invoke('todo:batchDone', params),
          abandon: (id: string) => ipcRenderer.invoke('todo:abandon', id),
          done: (id: string) => ipcRenderer.invoke('todo:done', id),
          restore: (id: string) => ipcRenderer.invoke('todo:restore', id),
        },

        habit: {
           create: (habitData: any) => ipcRenderer.invoke('habit:create', habitData),
           page: (filter: any) => ipcRenderer.invoke('habit:page', filter),
           list: (filter: any) => ipcRenderer.invoke('habit:list', filter),
           findById: (id: string) => ipcRenderer.invoke('habit:findById', id),
           findByIdWithRelations: (id: string) => ipcRenderer.invoke('habit:findByIdWithRelations', id),
           findByGoalId: (goalId: string) => ipcRenderer.invoke('habit:findByGoalId', goalId),
           getHabitTodos: (id: string) => ipcRenderer.invoke('habit:getHabitTodos', id),
           getHabitAnalytics: (id: string) => ipcRenderer.invoke('habit:getHabitAnalytics', id),
           update: (id: string, data: any) => ipcRenderer.invoke('habit:update', id, data),
           delete: (id: string) => ipcRenderer.invoke('habit:delete', id),
           batchDone: (params: { idList: string[] }) => ipcRenderer.invoke('habit:batchDone', params),
           abandon: (id: string) => ipcRenderer.invoke('habit:abandon', id),
           restore: (id: string) => ipcRenderer.invoke('habit:restore', id),
           pause: (id: string) => ipcRenderer.invoke('habit:pause', id),
           resume: (id: string) => ipcRenderer.invoke('habit:resume', id),
         }
        },
      
      // 文件操作相关 API
      readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
      
      // 事件监听相关 API
      on: (channel: string, listener: (...args: any[]) => void) => {
        ipcRenderer.on(channel, listener);
      },
      removeListener: (channel: string, listener: (...args: any[]) => void) => {
        ipcRenderer.removeListener(channel, listener);
      }
    } as ElectronAPI); 
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