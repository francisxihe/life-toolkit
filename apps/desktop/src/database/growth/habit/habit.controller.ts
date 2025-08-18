import { ipcMain } from 'electron';
import { habitService } from './habit.service';
import { HabitStatus } from './habit.entity';
import type { Habit as HabitVO } from '@life-toolkit/vo';
import { HabitMapper } from '@life-toolkit/business-server';

/**
 * 注册习惯相关的 IPC 处理器
 */
export function registerHabitIpcHandlers(): void {
  // 习惯相关
  ipcMain.handle(
    '/habit/create',
    async (
      _,
      createVo: HabitVO.CreateHabitVo
    ): Promise<HabitVO.HabitVo> => {
      const createDto = HabitMapper.voToCreateDto(createVo);
      const dto = await habitService.create(createDto as any);
      return HabitMapper.dtoToVo(dto);
    }
  );

  ipcMain.handle(
    '/habit/findAll',
    async (): Promise<HabitVO.HabitItemVo[]> => {
      const list = await habitService.findAll();
      return list.map((dto) => HabitMapper.dtoToItemVo(dto));
    }
  );

  ipcMain.handle(
    '/habit/findById',
    async (_, id: string): Promise<HabitVO.HabitVo> => {
      const dto = await habitService.findById(id);
      return HabitMapper.dtoToVo(dto);
    }
  );

  ipcMain.handle('/habit/findActiveHabits', async () => {
    const list = await habitService.findActiveHabits();
    return list.map((dto) => HabitMapper.dtoToItemVo(dto));
  });

  ipcMain.handle(
    '/habit/findByStatus',
    async (_, status: any): Promise<HabitVO.HabitItemVo[]> => {
      const list = await habitService.findByStatus(status);
      return list.map((dto) => HabitMapper.dtoToItemVo(dto));
    }
  );

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

  ipcMain.handle(
    '/habit/update',
    async (
      _,
      id: string,
      updateVo: HabitVO.UpdateHabitVo
    ): Promise<HabitVO.HabitVo> => {
      const updateDto = HabitMapper.voToUpdateDto(updateVo);
      const dto = await habitService.update(id, updateDto as any);
      return HabitMapper.dtoToVo(dto);
    }
  );

  ipcMain.handle('/habit/delete', async (_, id: string) => {
    return await habitService.delete(id);
  });

  ipcMain.handle(
    '/habit/page',
    async (_, filter: any): Promise<HabitVO.HabitPageVo> => {
      const pageNum = Number(filter.pageNum) || 1;
      const pageSize = Number(filter.pageSize) || 10;
      const res = await habitService.page(pageNum, pageSize);
      return HabitMapper.dtoToPageVo(res.data, res.total, pageNum, pageSize);
    }
  );

  ipcMain.handle('/habit/list', async () => {
    const list = await habitService.list();
    return HabitMapper.dtoToListVo(list);
  });

  ipcMain.handle('/habit/findByIdWithRelations', async (_, id: string) => {
    return await habitService.findByIdWithRelations(id);
  });

  ipcMain.handle('/habit/findByGoalId', async (_, goalId: string) => {
    const list = await habitService.findByGoalId(goalId);
    return list.map((dto) => HabitMapper.dtoToItemVo(dto));
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
    const dto = await habitService.update(id, { status: HabitStatus.PAUSED });
    return HabitMapper.dtoToVo(dto as any);
  });

  ipcMain.handle('/habit/restore', async (_, id: string) => {
    const dto = await habitService.update(id, { status: HabitStatus.ACTIVE });
    return HabitMapper.dtoToVo(dto as any);
  });

  ipcMain.handle('/habit/pause', async (_, id: string) => {
    return await habitService.pauseHabit(id);
  });

  ipcMain.handle('/habit/resume', async (_, id: string) => {
    return await habitService.resumeHabit(id);
  });
}