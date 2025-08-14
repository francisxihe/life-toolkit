import { ipcMain } from 'electron';
import { todoService } from './todo.service';

/**
 * 注册待办事项相关的 IPC 处理器
 */
export function registerTodoIpcHandlers(): void {
  // 待办事项相关
  ipcMain.handle('/todo/create', async (_, todoData) => {
    return await todoService.createTodo(todoData);
  });

  ipcMain.handle('/todo/findAll', async () => {
    return await todoService.findAll();
  });

  ipcMain.handle('/todo/findById', async (_, id) => {
    return await todoService.findById(id);
  });

  ipcMain.handle('/todo/findByStatus', async (_, status) => {
    return await todoService.findByStatus(status);
  });

  ipcMain.handle('/todo/findTodayTodos', async () => {
    return await todoService.findTodayTodos();
  });

  ipcMain.handle('/todo/findOverdueTodos', async () => {
    return await todoService.findOverdueTodos();
  });

  ipcMain.handle('/todo/findHighImportanceTodos', async () => {
    return await todoService.findHighImportanceTodos();
  });

  ipcMain.handle('/todo/updateStatus', async (_, id, status) => {
    return await todoService.updateStatus(id, status);
  });

  ipcMain.handle('/todo/update', async (_, id: string, data) => {
    return await todoService.update(id, data);
  });

  ipcMain.handle('/todo/delete', async (_, id: string) => {
    return await todoService.delete(id);
  });

  ipcMain.handle('/todo/page', async (_, filter: any) => {
    const pageNum = Number(filter.pageNum) || 1;
    const pageSize = Number(filter.pageSize) || 10;
    return await todoService.page(pageNum, pageSize);
  });

  ipcMain.handle('/todo/list', async (_, filter: any) => {
    return await todoService.list(filter);
  });

  ipcMain.handle('/todo/batchDone', async (_, params: { idList: string[] }) => {
    return await todoService.batchDone(params.idList);
  });

  ipcMain.handle('/todo/abandon', async (_, id: string) => {
    return await todoService.abandon(id);
  });

  ipcMain.handle('/todo/restore', async (_, id: string) => {
    return await todoService.restore(id);
  });

  ipcMain.handle('/todo/done', async (_, id: string) => {
    return await todoService.done(id);
  });

  ipcMain.handle('/todo/getStatistics', async () => {
    return await todoService.getStatistics();
  });
}