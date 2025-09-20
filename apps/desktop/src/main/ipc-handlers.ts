import { GoalController } from '../database/growth/goal/goal.controller';
import { HabitController } from '../database/growth/habit/habit.controller';
import { TaskController } from '../database/growth/task/task.controller';
import { TodoController } from '../database/growth/todo/todo.controller';
import { registerIpcHandlers } from 'electron-ipc-restful';

/**
 * 初始化所有 IPC 处理器
 */
export function initIpcRouter(): void {
  registerIpcHandlers({
    controllers: [GoalController, HabitController, TaskController, TodoController],
  });
}
