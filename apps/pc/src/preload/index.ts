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
      
      // 数据库相关 API
      database: {
        // 用户相关
        createUser: (userData: any) => ipcRenderer.invoke('user:create', userData),
        findUserByUsername: (username: string) => ipcRenderer.invoke('user:findByUsername', username),
        findUserById: (id: string) => ipcRenderer.invoke('user:findById', id),
        updateUser: (id: string, data: any) => ipcRenderer.invoke('user:update', id, data),
        
        // 目标相关
        createGoal: (goalData: any) => ipcRenderer.invoke('goal:create', goalData),
        findAllGoals: () => ipcRenderer.invoke('goal:findAll'),
        findGoalById: (id: string) => ipcRenderer.invoke('goal:findById', id),
        findGoalTree: () => ipcRenderer.invoke('goal:findTree'),
        findRootGoals: () => ipcRenderer.invoke('goal:findRoots'),
        findGoalChildren: (parentId: string) => ipcRenderer.invoke('goal:findChildren', parentId),
        findGoalsByType: (type: string) => ipcRenderer.invoke('goal:findByType', type),
        findGoalsByStatus: (status: string) => ipcRenderer.invoke('goal:findByStatus', status),
        updateGoal: (id: string, data: any) => ipcRenderer.invoke('goal:update', id, data),
        deleteGoal: (id: string) => ipcRenderer.invoke('goal:delete', id),
        
        // 任务相关
        createTask: (taskData: any) => ipcRenderer.invoke('task:create', taskData),
        findAllTasks: () => ipcRenderer.invoke('task:findAll'),
        findTaskById: (id: string) => ipcRenderer.invoke('task:findById', id),
        findTaskTree: () => ipcRenderer.invoke('task:findTree'),
        findTasksByGoalId: (goalId: string) => ipcRenderer.invoke('task:findByGoalId', goalId),
        findTasksByStatus: (status: string) => ipcRenderer.invoke('task:findByStatus', status),
        updateTaskStatus: (id: string, status: string) => ipcRenderer.invoke('task:updateStatus', id, status),
        updateTask: (id: string, data: any) => ipcRenderer.invoke('task:update', id, data),
        deleteTask: (id: string) => ipcRenderer.invoke('task:delete', id),
        
        // 待办事项相关
        createTodo: (todoData: any) => ipcRenderer.invoke('todo:create', todoData),
        findAllTodos: () => ipcRenderer.invoke('todo:findAll'),
        findTodoById: (id: string) => ipcRenderer.invoke('todo:findById', id),
        findTodosByStatus: (status: string) => ipcRenderer.invoke('todo:findByStatus', status),
        findTodayTodos: () => ipcRenderer.invoke('todo:findTodayTodos'),
        findOverdueTodos: () => ipcRenderer.invoke('todo:findOverdueTodos'),
        findHighImportanceTodos: () => ipcRenderer.invoke('todo:findHighImportanceTodos'),
        updateTodoStatus: (id: string, status: string) => ipcRenderer.invoke('todo:updateStatus', id, status),
        updateTodo: (id: string, data: any) => ipcRenderer.invoke('todo:update', id, data),
        deleteTodo: (id: string) => ipcRenderer.invoke('todo:delete', id),
        getTodoStatistics: () => ipcRenderer.invoke('todo:getStatistics'),
        
        // 习惯相关
        createHabit: (habitData: any) => ipcRenderer.invoke('habit:create', habitData),
        findAllHabits: () => ipcRenderer.invoke('habit:findAll'),
        findHabitById: (id: string) => ipcRenderer.invoke('habit:findById', id),
        findActiveHabits: () => ipcRenderer.invoke('habit:findActiveHabits'),
        findHabitsByStatus: (status: string) => ipcRenderer.invoke('habit:findByStatus', status),
        updateHabitStreak: (id: string, completed: boolean) => ipcRenderer.invoke('habit:updateStreak', id, completed),
        getHabitStatistics: (id: string) => ipcRenderer.invoke('habit:getStatistics', id),
        getOverallHabitStatistics: () => ipcRenderer.invoke('habit:getOverallStatistics'),
        pauseHabit: (id: string) => ipcRenderer.invoke('habit:pauseHabit', id),
        resumeHabit: (id: string) => ipcRenderer.invoke('habit:resumeHabit', id),
        completeHabit: (id: string) => ipcRenderer.invoke('habit:completeHabit', id),
        updateHabit: (id: string, data: any) => ipcRenderer.invoke('habit:update', id, data),
        deleteHabit: (id: string) => ipcRenderer.invoke('habit:delete', id),
        
        // 枚举获取
        getGoalTypes: () => ipcRenderer.invoke('goal:getTypes'),
        getGoalStatuses: () => ipcRenderer.invoke('goal:getStatuses'),
        getTaskStatuses: () => ipcRenderer.invoke('task:getStatuses'),
        getTaskPriorities: () => ipcRenderer.invoke('task:getPriorities'),
        getTodoStatuses: () => ipcRenderer.invoke('todo:getStatuses'),
        getHabitStatuses: () => ipcRenderer.invoke('habit:getStatuses'),
        getHabitDifficulties: () => ipcRenderer.invoke('habit:getDifficulties')
      }
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