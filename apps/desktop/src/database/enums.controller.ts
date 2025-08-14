import { ipcMain } from 'electron';
import { GoalType, GoalStatus } from './growth/goal/goal.entity';
import { TaskStatus } from './growth/task/task.entity';
import { TodoStatus, TodoSource } from './growth/todo/todo.entity';
import { HabitStatus, HabitDifficulty } from './growth/habit/habit.entity';

/**
 * 注册枚举类型相关的 IPC 处理器
 */
export function registerEnumsIpcHandlers(): void {
  // 枚举类型导出（供前端使用）
  ipcMain.handle('enums:getGoalTypes', () => {
    return Object.values(GoalType);
  });

  ipcMain.handle('enums:getGoalStatuses', () => {
    return Object.values(GoalStatus);
  });

  ipcMain.handle('enums:getTaskStatuses', () => {
    return Object.values(TaskStatus);
  });

  ipcMain.handle('enums:getTodoStatuses', () => {
    return Object.values(TodoStatus);
  });

  ipcMain.handle('enums:getTodoSources', () => {
    return Object.values(TodoSource);
  });

  ipcMain.handle('enums:getHabitStatuses', () => {
    return Object.values(HabitStatus);
  });

  ipcMain.handle('enums:getHabitDifficulties', () => {
    return Object.values(HabitDifficulty);
  });
}