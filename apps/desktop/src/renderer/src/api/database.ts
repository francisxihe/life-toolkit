import {
  User,
  CreateUserData,
  GoalVo,
  CreateGoalData,
  TaskVo,
  CreateTaskData,
  TodoVo,
  CreateTodoData,
  HabitVo,
  CreateHabitData,
  GoalStatus,
  TaskStatus,
  TodoStatus,
  HabitStatus
} from '../types/database';

/**
 * 数据库 API 接口
 * 封装与主进程的 IPC 通信
 */
export class DatabaseAPI {
  private static get ipc() {
    return (window as any).electronAPI;
  }
  
  // 用户相关
  static async createUser(userData: CreateUserData): Promise<User> {
    return await this.ipc.invoke('user:create', userData);
  }

  static async findUserByUsername(username: string): Promise<User | null> {
    return await this.ipc.invoke('user:findByUsername', username);
  }

  static async findUserById(id: string): Promise<User | null> {
    return await this.ipc.invoke('user:findById', id);
  }

  static async updateUser(id: string, data: Partial<User>): Promise<User> {
    return await this.ipc.invoke('user:update', id, data);
  }

  // 目标相关
  static async createGoal(goalData: CreateGoalData): Promise<GoalVo> {
    return await this.ipc.invoke('goal:create', goalData);
  }

  static async findAllGoals(): Promise<GoalVo[]> {
    return await this.ipc.invoke('goal:findAll');
  }

  static async findGoalById(id: string): Promise<GoalVo | null> {
    return await this.ipc.invoke('goal:findById', id);
  }

  static async findGoalTree(): Promise<GoalVo[]> {
    return await this.ipc.invoke('goal:findTree');
  }

  static async findRootGoals(): Promise<GoalVo[]> {
    return await this.ipc.invoke('goal:findRoots');
  }

  static async findGoalChildren(parentId: string): Promise<GoalVo[]> {
    return await this.ipc.invoke('goal:findChildren', parentId);
  }

  static async findGoalsByType(type: string): Promise<GoalVo[]> {
    return await this.ipc.invoke('goal:findByType', type);
  }

  static async findGoalsByStatus(status: GoalStatus): Promise<GoalVo[]> {
    return await this.ipc.invoke('goal:findByStatus', status);
  }

  static async updateGoal(id: string, data: Partial<GoalVo>): Promise<GoalVo> {
    return await this.ipc.invoke('goal:update', id, data);
  }

  static async deleteGoal(id: string): Promise<void> {
    return await this.ipc.invoke('goal:delete', id);
  }

  // 任务相关
  static async createTask(taskData: CreateTaskData): Promise<TaskVo> {
    return await this.ipc.invoke('task:create', taskData);
  }

  static async findAllTasks(): Promise<TaskVo[]> {
    return await this.ipc.invoke('task:findAll');
  }

  static async findTaskById(id: string): Promise<TaskVo | null> {
    return await this.ipc.invoke('task:findById', id);
  }

  static async findTaskTree(): Promise<TaskVo[]> {
    return await this.ipc.invoke('task:findTree');
  }

  static async findTasksByGoal(goalId: string): Promise<TaskVo[]> {
    return await this.ipc.invoke('task:findByGoalId', goalId);
  }

  static async findTasksByStatus(status: TaskStatus): Promise<TaskVo[]> {
    return await this.ipc.invoke('task:findByStatus', status);
  }

  static async updateTask(id: string, data: Partial<TaskVo>): Promise<TaskVo> {
    return await this.ipc.invoke('task:update', id, data);
  }

  static async deleteTask(id: string): Promise<void> {
    return await this.ipc.invoke('task:delete', id);
  }

  // Todo 相关
  static async createTodo(todoData: CreateTodoData): Promise<TodoVo> {
    return await this.ipc.invoke('todo:create', todoData);
  }

  static async findAllTodos(): Promise<TodoVo[]> {
    return await this.ipc.invoke('todo:findAll');
  }

  static async findTodoById(id: string): Promise<TodoVo | null> {
    return await this.ipc.invoke('todo:findById', id);
  }

  static async findTodosByStatus(status: TodoStatus): Promise<TodoVo[]> {
    return await this.ipc.invoke('todo:findByStatus', status);
  }

  static async findTodayTodos(): Promise<TodoVo[]> {
    return await this.ipc.invoke('todo:findTodayTodos');
  }

  static async findOverdueTodos(): Promise<TodoVo[]> {
    return await this.ipc.invoke('todo:findOverdueTodos');
  }

  static async findHighImportanceTodos(): Promise<TodoVo[]> {
    return await this.ipc.invoke('todo:findHighImportanceTodos');
  }

  static async updateTodo(id: string, data: Partial<TodoVo>): Promise<TodoVo> {
    return await this.ipc.invoke('todo:update', id, data);
  }

  static async updateTodoStatus(id: string, status: TodoStatus): Promise<TodoVo> {
    return await this.ipc.invoke('todo:updateStatus', id, status);
  }

  static async deleteTodo(id: string): Promise<void> {
    return await this.ipc.invoke('todo:delete', id);
  }

  static async getTodoStatistics(): Promise<any> {
    return await this.ipc.invoke('todo:getStatistics');
  }

  // 习惯相关
  static async createHabit(habitData: CreateHabitData): Promise<HabitVo> {
    return await this.ipc.invoke('habit:create', habitData);
  }

  static async findAllHabits(): Promise<HabitVo[]> {
    return await this.ipc.invoke('habit:findAll');
  }

  static async findHabitById(id: string): Promise<HabitVo | null> {
    return await this.ipc.invoke('habit:findById', id);
  }

  static async findActiveHabits(): Promise<HabitVo[]> {
    return await this.ipc.invoke('habit:findActiveHabits');
  }

  static async findHabitsByStatus(status: HabitStatus): Promise<HabitVo[]> {
    return await this.ipc.invoke('habit:findByStatus', status);
  }

  static async updateHabitStreak(id: string, completed: boolean): Promise<HabitVo> {
    return await this.ipc.invoke('habit:updateStreak', id, completed);
  }

  static async getHabitStatistics(id: string): Promise<any> {
    return await this.ipc.invoke('habit:getStatistics', id);
  }

  static async getOverallHabitStatistics(): Promise<any> {
    return await this.ipc.invoke('habit:getOverallStatistics');
  }

  static async pauseHabit(id: string): Promise<HabitVo> {
    return await this.ipc.invoke('habit:pauseHabit', id);
  }

  static async resumeHabit(id: string): Promise<HabitVo> {
    return await this.ipc.invoke('habit:resumeHabit', id);
  }

  static async completeHabit(id: string): Promise<HabitVo> {
    return await this.ipc.invoke('habit:completeHabit', id);
  }

  static async updateHabit(id: string, data: Partial<HabitVo>): Promise<HabitVo> {
    return await this.ipc.invoke('habit:update', id, data);
  }

  static async deleteHabit(id: string): Promise<void> {
    return await this.ipc.invoke('habit:delete', id);
  }
}