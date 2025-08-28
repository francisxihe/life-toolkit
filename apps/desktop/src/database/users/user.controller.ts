import { ipcMain } from 'electron';
import { userService } from './user.service';

/**
 * 注册用户相关的 IPC 处理器
 */
export function registerUserIpcHandlers(): void {
  // 用户相关
  ipcMain.handle('/user/create', async (_, userData) => {
    return await userService.createUser(userData);
  });

  ipcMain.handle('/user/findAll', async () => {
    return await userService.findAll();
  });

  ipcMain.handle('/user/detail', async (_, id) => {
    return await userService.findById(id);
  });

  ipcMain.handle('/user/update', async (_, id, data) => {
    return await userService.update(id, data);
  });

  ipcMain.handle('/user/delete', async (_, id) => {
    return await userService.delete(id);
  });

  ipcMain.handle('/user/page', async (_, filter: any) => {
    const pageNum = Number(filter.pageNum) || 1;
    const pageSize = Number(filter.pageSize) || 10;
    return await userService.page(pageNum, pageSize);
  });

  ipcMain.handle('/user/list', async () => {
    return await userService.list();
  });
}