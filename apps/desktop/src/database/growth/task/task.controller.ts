import { ipcMain } from 'electron';
import { taskService } from './task.service';
import { TaskStatus } from './task.entity';
import type { Task as TaskVO } from '@life-toolkit/vo';
import { TaskMapper } from '@life-toolkit/business-server';

/**
 * 注册任务相关的 IPC 处理器
 */
export function registerTaskIpcHandlers(): void {
  // 任务相关
  ipcMain.handle(
    '/task/create',
    async (
      _,
      createVo: TaskVO.CreateTaskVo
    ): Promise<TaskVO.TaskVo | TaskVO.TaskItemVo> => {
      const dto = await taskService.create(TaskMapper.voToCreateDto(createVo) as any);
      return TaskMapper.dtoToVo(dto);
    }
  );

  ipcMain.handle('/task/findAll', async (): Promise<TaskVO.TaskVo[]> => {
    const list = await taskService.findAll();
    return TaskMapper.dtoToVoList(list);
  });

  ipcMain.handle('/task/findById', async (_, id: string): Promise<TaskVO.TaskVo> => {
    const dto = await taskService.findById(id);
    return TaskMapper.dtoToVo(dto);
  });

  ipcMain.handle('/task/findTree', async (): Promise<TaskVO.TaskVo[]> => {
    const entities = await taskService.findTree();
    return (entities || []).map((e: any) => TaskMapper.dtoToVo(TaskMapper.entityToDto(e)));
  });

  ipcMain.handle('/task/findByGoalId', async (_, goalId: string): Promise<TaskVO.TaskVo[]> => {
    const list = await taskService.findByGoalId(goalId);
    return TaskMapper.dtoToVoList(list);
  });

  ipcMain.handle('/task/findByStatus', async (_, status: any): Promise<TaskVO.TaskVo[]> => {
    const list = await taskService.findByStatus(status);
    return TaskMapper.dtoToVoList(list);
  });

  ipcMain.handle('/task/updateStatus', async (_, id, status) => {
    return await taskService.updateStatus(id, status);
  });

  ipcMain.handle(
    '/task/update',
    async (
      _,
      id: string,
      updateVo: TaskVO.UpdateTaskVo
    ): Promise<TaskVO.TaskVo> => {
      const dto = await taskService.update(id, TaskMapper.voToUpdateDto(updateVo as any) as any);
      return TaskMapper.dtoToVo(dto);
    }
  );

  ipcMain.handle('/task/delete', async (_, id: string) => {
    return await taskService.delete(id);
  });

  ipcMain.handle(
    '/task/page',
    async (_, filter: any): Promise<TaskVO.TaskPageVo> => {
      const pageNum = Number(filter.pageNum) || 1;
      const pageSize = Number(filter.pageSize) || 10;
      const res = await taskService.page(pageNum, pageSize);
      return TaskMapper.dtoToPageVo(res.data, res.total, pageNum, pageSize);
    }
  );

  ipcMain.handle('/task/list', async (): Promise<TaskVO.TaskListVo> => {
    const list = await taskService.list();
    return TaskMapper.dtoToListVo(list);
  });

  ipcMain.handle('/task/taskWithTrackTime', async (_, id: string): Promise<TaskVO.TaskWithTrackTimeVo> => {
    const dto = await taskService.taskWithTrackTime(id);
    return TaskMapper.dtoToWithTrackTimeVo(dto);
  });

  ipcMain.handle('/task/batchDone', async (_, params: { idList: string[] }) => {
    const list = await Promise.all(params.idList.map(id => taskService.update(id, { status: TaskStatus.DONE })));
    return list.map((dto) => TaskMapper.dtoToVo(dto as any));
  });

  ipcMain.handle('/task/abandon', async (_, id: string): Promise<TaskVO.TaskVo> => {
    const dto = await taskService.update(id, { status: TaskStatus.ABANDONED });
    return TaskMapper.dtoToVo(dto as any);
  });

  ipcMain.handle('/task/restore', async (_, id: string): Promise<TaskVO.TaskVo> => {
    const dto = await taskService.update(id, { status: TaskStatus.TODO });
    return TaskMapper.dtoToVo(dto as any);
  });
}