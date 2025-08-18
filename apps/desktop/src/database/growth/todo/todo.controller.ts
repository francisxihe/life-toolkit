import { ipcMain } from 'electron';
import { todoService } from './todo.service';
import type { Todo as TodoVO } from '@life-toolkit/vo';
import { TodoMapper } from '@life-toolkit/business-server';

/**
 * 注册待办事项相关的 IPC 处理器
 */
export function registerTodoIpcHandlers(): void {
  // 待办事项相关
  ipcMain.handle(
    '/todo/create',
    async (
      _,
      createVo: TodoVO.CreateTodoVo
    ): Promise<TodoVO.TodoVo> => {
      const createDto = TodoMapper.voToCreateDto(createVo);
      const dto = await todoService.createTodo(createDto as any);
      return TodoMapper.dtoToVo(dto);
    }
  );

  ipcMain.handle('/todo/findAll', async (): Promise<TodoVO.TodoVo[]> => {
    const list = await todoService.findAll();
    return TodoMapper.dtoToVoList(list);
  });

  ipcMain.handle('/todo/findById', async (_, id: string): Promise<TodoVO.TodoVo> => {
    const dto = await todoService.findById(id);
    return TodoMapper.dtoToVo(dto);
  });

  ipcMain.handle('/todo/findByStatus', async (_, status: any): Promise<TodoVO.TodoVo[]> => {
    const list = await todoService.findByStatus(status);
    return TodoMapper.dtoToVoList(list);
  });

  ipcMain.handle('/todo/findTodayTodos', async (): Promise<TodoVO.TodoVo[]> => {
    const list = await todoService.findTodayTodos();
    return TodoMapper.dtoToVoList(list);
  });

  ipcMain.handle('/todo/findOverdueTodos', async (): Promise<TodoVO.TodoVo[]> => {
    const list = await todoService.findOverdueTodos();
    return TodoMapper.dtoToVoList(list);
  });

  ipcMain.handle('/todo/findHighImportanceTodos', async (): Promise<TodoVO.TodoVo[]> => {
    const list = await todoService.findHighImportanceTodos();
    return TodoMapper.dtoToVoList(list);
  });

  ipcMain.handle('/todo/updateStatus', async (_, id: string, status: any) => {
    return await todoService.updateStatus(id, status);
  });

  ipcMain.handle(
    '/todo/update',
    async (
      _,
      id: string,
      updateVo: TodoVO.UpdateTodoVo
    ): Promise<TodoVO.TodoVo> => {
      const updateDto = TodoMapper.voToUpdateDto(updateVo);
      const dto = await todoService.update(id, updateDto as any);
      return TodoMapper.dtoToVo(dto);
    }
  );

  ipcMain.handle('/todo/delete', async (_, id: string) => {
    return await todoService.delete(id);
  });

  ipcMain.handle(
    '/todo/page',
    async (_, filter: any): Promise<TodoVO.TodoPageVo> => {
      const pageNum = Number(filter.pageNum) || 1;
      const pageSize = Number(filter.pageSize) || 10;
      const res = await todoService.page(pageNum, pageSize);
      return TodoMapper.dtoToPageVo(res.data, res.total, res.pageNum, res.pageSize);
    }
  );

  ipcMain.handle('/todo/list', async (_, filter: any): Promise<TodoVO.TodoListVo> => {
    const res: any = await todoService.list(filter ?? {});
    if (Array.isArray(res)) {
      return TodoMapper.dtoToListVo(res);
    }
    return res as TodoVO.TodoListVo;
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