import { ipcMain } from 'electron';
import { goalService } from './goal.service';
import { GoalStatus } from './goal.entity';

/**
 * 注册目标相关的 IPC 处理器
 */
export function registerGoalIpcHandlers(): void {
  // 目标相关
  ipcMain.handle('/goal/create', async (_, goalData) => {
    return await goalService.create(goalData);
  });

  ipcMain.handle('/goal/findAll', async () => {
    return await goalService.findAll();
  });

  ipcMain.handle('/goal/findById', async (_, id) => {
    return await goalService.findById(id);
  });

  ipcMain.handle('/goal/findTree', async () => {
    return await goalService.findTree();
  });

  ipcMain.handle('/goal/findRoots', async () => {
    return await goalService.findRoots();
  });

  ipcMain.handle('/goal/findChildren', async (_, parentId) => {
    return await goalService.findChildren(parentId);
  });

  ipcMain.handle('/goal/findByType', async (_, type) => {
    return await goalService.findByType(type);
  });

  ipcMain.handle('/goal/findByStatus', async (_, status) => {
    return await goalService.findByStatus(status);
  });

  ipcMain.handle('/goal/update', async (_, id: string, data) => {
    return await goalService.update(id, data);
  });

  ipcMain.handle('/goal/delete', async (_, id: string) => {
    return await goalService.delete(id);
  });

  ipcMain.handle('/goal/page', async (_, filter: any) => {
    const pageNum = Number(filter.pageNum) || 1;
    const pageSize = Number(filter.pageSize) || 10;
    return await goalService.page(pageNum, pageSize);
  });

  ipcMain.handle('/goal/batchDone', async (_, params: { idList: string[] }) => {
    return await goalService.batchDone(params.idList);
  });

  ipcMain.handle('/goal/list', async (_, filter: any) => {
    return await goalService.findAll();
  });

  ipcMain.handle('/goal/getTree', async (_, filter: any) => {
    return await goalService.findTree();
  });

  ipcMain.handle('/goal/findDetail', async (_, id: string) => {
    return await goalService.findById(id);
  });

  ipcMain.handle('/goal/abandon', async (_, id: string) => {
    return await goalService.update(id, { status: GoalStatus.ABANDONED });
  });

  ipcMain.handle('/goal/restore', async (_, id: string) => {
    return await goalService.update(id, { status: GoalStatus.TODO });
  });
}