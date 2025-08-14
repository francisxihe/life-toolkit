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
  readFile?: (
    filePath: string
  ) => Promise<{ success: boolean; message: string }>;

  // 事件监听
  on?: (channel: string, callback: (data: any) => void) => boolean;
  removeListener?: (channel: string) => boolean;

  // 数据库操作
  get: <T>(path: string, params?: any) => Promise<T>;
  post: <T>(path: string, params?: any) => Promise<T>;
  put: <T>(path: string, params?: any) => Promise<T>;
  remove: <T>(path: string, params?: any) => Promise<T>;

  //  {
  // user: {
  //   // 用户相关
  //   create: (userData: any) => Promise<any>;
  //   findAll: () => Promise<any[]>;
  //   findOne: (id: string) => Promise<any>;
  //   update: (id: string, data: any) => Promise<any>;
  //   remove: (id: string) => Promise<void>;
  // };

  // goal: {
  //   // 目标相关
  //   create: (goalData: any) => Promise<any>;
  //   page: (filter: any) => Promise<{ list: any[]; total: number }>;
  //   list: (filter: any) => Promise<any[]>;
  //   getTree: (filter: any) => Promise<any[]>;
  //   findDetail: (id: string) => Promise<any>;
  //   update: (id: string, data: any) => Promise<any>;
  //   delete: (id: string) => Promise<void>;
  //   batchDone: (params: { idList: string[] }) => Promise<void>;
  //   abandon: (id: string) => Promise<{ result: boolean }>;
  //   restore: (id: string) => Promise<{ result: boolean }>;
  // };

  // task: {
  //   // 任务相关
  //   create: (taskData: any) => Promise<any>;
  //   page: (filter: any) => Promise<{ list: any[]; total: number }>;
  //   list: (filter: any) => Promise<any[]>;
  //   findById: (id: string) => Promise<any>;
  //   taskWithTrackTime: (id: string) => Promise<any>;
  //   update: (id: string, data: any) => Promise<any>;
  //   delete: (id: string) => Promise<void>;
  //   batchDone: (params: { idList: string[] }) => Promise<void>;
  //   abandon: (id: string) => Promise<{ result: boolean }>;
  //   restore: (id: string) => Promise<{ result: boolean }>;
  // };

  // todo: {
  //   // 待办事项相关
  //   create: (todoData: any) => Promise<any>;
  //   page: (filter: any) => Promise<{ list: any[]; total: number }>;
  //   list: (filter: any) => Promise<any[]>;
  //   findById: (id: string) => Promise<any>;
  //   update: (id: string, data: any) => Promise<any>;
  //   delete: (id: string) => Promise<void>;
  //   batchDone: (params: { idList: string[] }) => Promise<void>;
  //   abandon: (id: string) => Promise<{ result: boolean }>;
  //   done: (id: string) => Promise<{ result: boolean }>;
  //   restore: (id: string) => Promise<{ result: boolean }>;
  // };

  // habit: {
  //   // 习惯相关
  //   create: (habitData: any) => Promise<any>;
  //   page: (filter: any) => Promise<{ list: any[]; total: number }>;
  //   list: (filter: any) => Promise<any[]>;
  //   findById: (id: string) => Promise<any>;
  //   findByIdWithRelations: (id: string) => Promise<any>;
  //   findByGoalId: (goalId: string) => Promise<any[]>;
  //   getHabitTodos: (id: string) => Promise<any>;
  //   getHabitAnalytics: (id: string) => Promise<any>;
  //   update: (id: string, data: any) => Promise<any>;
  //   delete: (id: string) => Promise<void>;
  //   batchDone: (params: { idList: string[] }) => Promise<void>;
  //   abandon: (id: string) => Promise<{ result: boolean }>;
  //   restore: (id: string) => Promise<{ result: boolean }>;
  //   pause: (id: string) => Promise<{ result: boolean }>;
  //   resume: (id: string) => Promise<{ result: boolean }>;
  // };
  // };
}

// 全局Window类型扩展
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
