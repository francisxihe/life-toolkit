import { ipcMain } from 'electron';
import { services } from '../database/services';
import { GoalType, GoalStatus } from '../database/entities/goal.entity';
import { TaskStatus } from '../database/entities/task.entity';
import { TodoStatus, TodoSource } from '../database/entities/todo.entity';
import { HabitStatus, HabitDifficulty } from '../database/entities/habit.entity';

/**
 * 注册所有 IPC 处理器
 */
export function registerIpcHandlers(): void {
  // 用户相关
  ipcMain.handle('user:create', async (_, userData) => {
    return await services.user.createUser(userData);
  });

  ipcMain.handle('user:findByUsername', async (_, username) => {
    return await services.user.findByUsername(username);
  });

  ipcMain.handle('user:findById', async (_, id) => {
    return await services.user.findById(id);
  });

  ipcMain.handle('user:update', async (_, id, data) => {
    return await services.user.update(id, data);
  });

  // 目标相关
  ipcMain.handle('goal:create', async (_, goalData) => {
    return await services.goal.create(goalData);
  });

  ipcMain.handle('goal:findAll', async () => {
    return await services.goal.findAll();
  });

  ipcMain.handle('goal:findById', async (_, id) => {
    return await services.goal.findById(id);
  });

  ipcMain.handle('goal:findTree', async () => {
    return await services.goal.findTree();
  });

  ipcMain.handle('goal:findRoots', async () => {
    return await services.goal.findRoots();
  });

  ipcMain.handle('goal:findChildren', async (_, parentId) => {
    return await services.goal.findChildren(parentId);
  });

  ipcMain.handle('goal:findByType', async (_, type) => {
    return await services.goal.findByType(type);
  });

  ipcMain.handle('goal:findByStatus', async (_, status) => {
    return await services.goal.findByStatus(status);
  });

  ipcMain.handle('goal:update', async (_, id, data) => {
    return await services.goal.update(id, data);
  });

  ipcMain.handle('goal:delete', async (_, id) => {
    return await services.goal.delete(id);
  });

  // 任务相关
  ipcMain.handle('task:create', async (_, taskData) => {
    return await services.task.create(taskData);
  });

  ipcMain.handle('task:findAll', async () => {
    return await services.task.findAll();
  });

  ipcMain.handle('task:findById', async (_, id) => {
    return await services.task.findById(id);
  });

  ipcMain.handle('task:findTree', async () => {
    return await services.task.findTree();
  });

  ipcMain.handle('task:findByGoalId', async (_, goalId) => {
    return await services.task.findByGoalId(goalId);
  });

  ipcMain.handle('task:findByStatus', async (_, status) => {
    return await services.task.findByStatus(status);
  });

  ipcMain.handle('task:updateStatus', async (_, id, status) => {
    return await services.task.updateStatus(id, status);
  });

  ipcMain.handle('task:update', async (_, id, data) => {
    return await services.task.update(id, data);
  });

  ipcMain.handle('task:delete', async (_, id) => {
    return await services.task.delete(id);
  });

  // 待办事项相关
  ipcMain.handle('todo:create', async (_, todoData) => {
    return await services.todo.createTodo(todoData);
  });

  ipcMain.handle('todo:findAll', async () => {
    return await services.todo.findAll();
  });

  ipcMain.handle('todo:findById', async (_, id) => {
    return await services.todo.findById(id);
  });

  ipcMain.handle('todo:findByStatus', async (_, status) => {
    return await services.todo.findByStatus(status);
  });

  ipcMain.handle('todo:findTodayTodos', async () => {
    return await services.todo.findTodayTodos();
  });

  ipcMain.handle('todo:findOverdueTodos', async () => {
    return await services.todo.findOverdueTodos();
  });

  ipcMain.handle('todo:findHighImportanceTodos', async () => {
    return await services.todo.findHighImportanceTodos();
  });

  ipcMain.handle('todo:updateStatus', async (_, id, status) => {
    return await services.todo.updateStatus(id, status);
  });

  ipcMain.handle('todo:update', async (_, id, data) => {
    return await services.todo.update(id, data);
  });

  ipcMain.handle('todo:delete', async (_, id) => {
    return await services.todo.delete(id);
  });

  ipcMain.handle('todo:getStatistics', async () => {
    return await services.todo.getStatistics();
  });

  // 习惯相关
  ipcMain.handle('habit:create', async (_, habitData) => {
    return await services.habit.createHabit(habitData);
  });

  ipcMain.handle('habit:findAll', async () => {
    return await services.habit.findAll();
  });

  ipcMain.handle('habit:findById', async (_, id) => {
    return await services.habit.findById(id);
  });

  ipcMain.handle('habit:findActiveHabits', async () => {
    return await services.habit.findActiveHabits();
  });

  ipcMain.handle('habit:findByStatus', async (_, status) => {
    return await services.habit.findByStatus(status);
  });

  ipcMain.handle('habit:updateStreak', async (_, id, completed) => {
    return await services.habit.updateStreak(id, completed);
  });

  ipcMain.handle('habit:getStatistics', async (_, id) => {
    return await services.habit.getHabitStatistics(id);
  });

  ipcMain.handle('habit:getOverallStatistics', async () => {
    return await services.habit.getOverallStatistics();
  });

  ipcMain.handle('habit:pauseHabit', async (_, id) => {
    return await services.habit.pauseHabit(id);
  });

  ipcMain.handle('habit:resumeHabit', async (_, id) => {
    return await services.habit.resumeHabit(id);
  });

  ipcMain.handle('habit:completeHabit', async (_, id) => {
    return await services.habit.completeHabit(id);
  });

  ipcMain.handle('habit:update', async (_, id, data) => {
    return await services.habit.update(id, data);
  });

  ipcMain.handle('habit:delete', async (_, id) => {
    return await services.habit.delete(id);
  });

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