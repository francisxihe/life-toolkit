import { ipcMain } from 'electron';
import { taskService } from './task.service';
import { TaskStatus } from './task.entity';

/**
 * 注册任务相关的 IPC 处理器
 */
export function registerTaskIpcHandlers(): void {
  // 任务相关
  ipcMain.handle('/task/create', async (_, taskData) => {
    return await taskService.create(taskData);
  });

  ipcMain.handle('/task/findAll', async () => {
    return await taskService.findAll();
  });

  ipcMain.handle('/task/findById', async (_, id) => {
    return await taskService.findById(id);
  });

  ipcMain.handle('/task/findTree', async () => {
    return await taskService.findTree();
  });

  ipcMain.handle('/task/findByGoalId', async (_, goalId) => {
    return await taskService.findByGoalId(goalId);
  });

  ipcMain.handle('/task/findByStatus', async (_, status) => {
    return await taskService.findByStatus(status);
  });

  ipcMain.handle('/task/updateStatus', async (_, id, status) => {
    return await taskService.updateStatus(id, status);
  });

  ipcMain.handle('/task/update', async (_, id: string, data) => {
    return await taskService.update(id, data);
  });

  ipcMain.handle('/task/delete', async (_, id: string) => {
    return await taskService.delete(id);
  });

  ipcMain.handle('/task/page', async (_, filter: any) => {
    const pageNum = Number(filter.pageNum) || 1;
    const pageSize = Number(filter.pageSize) || 10;
    return await taskService.page(pageNum, pageSize);
  });

  ipcMain.handle('/task/list', async () => {
    return await taskService.list();
  });

  ipcMain.handle('/task/taskWithTrackTime', async (_, id: string) => {
    return await taskService.taskWithTrackTime(id);
  });

  ipcMain.handle('/task/batchDone', async (_, params: { idList: string[] }) => {
    return await Promise.all(params.idList.map(id => taskService.update(id, { status: TaskStatus.DONE })));
  });

  ipcMain.handle('/task/abandon', async (_, id: string) => {
    return await taskService.update(id, { status: TaskStatus.ABANDONED });
  });

  ipcMain.handle('/task/restore', async (_, id: string) => {
    return await taskService.update(id, { status: TaskStatus.TODO });
  });
}