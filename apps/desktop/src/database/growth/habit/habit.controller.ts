import { ipcMain } from 'electron';
import { habitService } from './habit.service';
import { HabitStatus } from './habit.entity';

/**
 * 注册习惯相关的 IPC 处理器
 */
export function registerHabitIpcHandlers(): void {
  // 习惯相关
  ipcMain.handle('/habit/create', async (_, habitData) => {
    return await habitService.createHabit(habitData);
  });

  ipcMain.handle('/habit/findAll', async () => {
    return await habitService.findAll();
  });

  ipcMain.handle('/habit/findById', async (_, id) => {
    return await habitService.findById(id);
  });

  ipcMain.handle('/habit/findActiveHabits', async () => {
    return await habitService.findActiveHabits();
  });

  ipcMain.handle('/habit/findByStatus', async (_, status) => {
    return await habitService.findByStatus(status);
  });

  ipcMain.handle('/habit/updateStreak', async (_, id, completed) => {
    return await habitService.updateStreak(id, completed);
  });

  ipcMain.handle('/habit/getStatistics', async (_, id) => {
    return await habitService.getHabitStatistics(id);
  });

  ipcMain.handle('/habit/getOverallStatistics', async () => {
    return await habitService.getOverallStatistics();
  });

  ipcMain.handle('/habit/pauseHabit', async (_, id) => {
    return await habitService.pauseHabit(id);
  });

  ipcMain.handle('/habit/resumeHabit', async (_, id) => {
    return await habitService.resumeHabit(id);
  });

  ipcMain.handle('/habit/completeHabit', async (_, id) => {
    return await habitService.completeHabit(id);
  });

  ipcMain.handle('/habit/update', async (_, id: string, data) => {
    return await habitService.update(id, data);
  });

  ipcMain.handle('/habit/delete', async (_, id: string) => {
    return await habitService.delete(id);
  });

  ipcMain.handle('/habit/page', async (_, filter: any) => {
    const pageNum = Number(filter.pageNum) || 1;
    const pageSize = Number(filter.pageSize) || 10;
    return await habitService.page(pageNum, pageSize);
  });

  ipcMain.handle('/habit/list', async () => {
    return await habitService.list();
  });

  ipcMain.handle('/habit/findByIdWithRelations', async (_, id: string) => {
    return await habitService.findByIdWithRelations(id);
  });

  ipcMain.handle('/habit/findByGoalId', async (_, goalId: string) => {
    return await habitService.findByGoalId(goalId);
  });

  ipcMain.handle('/habit/getHabitTodos', async (_, id: string) => {
    return await habitService.getHabitTodos(id);
  });

  ipcMain.handle('/habit/getHabitAnalytics', async (_, id: string) => {
    return await habitService.getHabitAnalytics(id);
  });

  ipcMain.handle('/habit/batchDone', async (_, params: { idList: string[] }) => {
    return await Promise.all(params.idList.map(id => habitService.update(id, { status: HabitStatus.COMPLETED })));
  });

  ipcMain.handle('/habit/abandon', async (_, id: string) => {
    return await habitService.update(id, { status: HabitStatus.PAUSED });
  });

  ipcMain.handle('/habit/restore', async (_, id: string) => {
    return await habitService.update(id, { status: HabitStatus.ACTIVE });
  });

  ipcMain.handle('/habit/pause', async (_, id: string) => {
    return await habitService.pauseHabit(id);
  });

  ipcMain.handle('/habit/resume', async (_, id: string) => {
    return await habitService.resumeHabit(id);
  });
}