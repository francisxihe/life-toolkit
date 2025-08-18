import { registerUserIpcHandlers } from '../database/users/user.controller';
import { registerGoalIpcHandlers } from '../database/growth/goal';
import { registerTaskIpcHandlers } from '../database/growth/task/task.controller';
import { registerTodoIpcHandlers } from '../database/growth/todo/todo.controller';
import { registerHabitIpcHandlers } from '../database/growth/habit/habit.controller';
import { registerEnumsIpcHandlers } from '../database/enums.controller';

/**
 * 注册所有 IPC 处理器
 */
export function registerIpcHandlers(): void {
  // 注册各个模块的 IPC 处理器
  registerUserIpcHandlers();
  registerGoalIpcHandlers();
  registerTaskIpcHandlers();
  registerTodoIpcHandlers();
  registerHabitIpcHandlers();
  registerEnumsIpcHandlers();
}