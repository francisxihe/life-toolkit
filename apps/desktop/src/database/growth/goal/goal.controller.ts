import { ipcMain } from "electron";
import { goalService } from "./goal.service";
import { GoalStatus } from "./goal.entity";
import type { Goal as GoalVO } from "@life-toolkit/vo";
import { GoalMapper } from "@life-toolkit/business-server";

/**
 * 注册目标相关的 IPC 处理器
 */
export function registerGoalIpcHandlers(): void {
  // 目标相关
  ipcMain.handle(
    "/goal/create",
    async (_, createVo: GoalVO.CreateGoalVo): Promise<GoalVO.GoalItemVo> => {
      const createDto = GoalMapper.voToCreateDto(createVo);
      const dto = await goalService.create(createDto as any);
      return GoalMapper.dtoToItemVo(dto);
    }
  );

  ipcMain.handle(
    "/goal/findAll",
    async (): Promise<GoalVO.GoalItemVo[]> => {
      const list = await goalService.findAll();
      return GoalMapper.dtoToVoList(list);
    }
  );

  ipcMain.handle(
    "/goal/findById",
    async (_, id: string): Promise<GoalVO.GoalVo> => {
      const dto = await goalService.findById(id);
      return GoalMapper.dtoToVo(dto);
    }
  );

  ipcMain.handle(
    "/goal/tree",
    async (): Promise<GoalVO.GoalVo[]> => {
      const list = await goalService.findTree();
      return (list || []).map((dto: any) => GoalMapper.dtoToVo(dto));
    }
  );

  ipcMain.handle(
    "/goal/findRoots",
    async (): Promise<GoalVO.GoalVo[]> => {
      const list = await goalService.findRoots();
      return (list || []).map((dto: any) => GoalMapper.dtoToVo(dto));
    }
  );

  ipcMain.handle(
    "/goal/findChildren",
    async (
      _,
      parentId: string
    ): Promise<(GoalVO.GoalVo | GoalVO.GoalItemVo)[]> => {
      const list = await goalService.findChildren(parentId);
      return (list || []).map((dto: any) => GoalMapper.dtoToVo(dto));
    }
  );

  ipcMain.handle(
    "/goal/findByType",
    async (_, type: any): Promise<GoalVO.GoalItemVo[]> => {
      const list = await goalService.findByType(type);
      return GoalMapper.dtoToVoList(list);
    }
  );

  ipcMain.handle(
    "/goal/findByStatus",
    async (_, status: any): Promise<GoalVO.GoalItemVo[]> => {
      const list = await goalService.findByStatus(status);
      return GoalMapper.dtoToVoList(list);
    }
  );

  ipcMain.handle(
    "/goal/update",
    async (
      _,
      id: string,
      updateVo: GoalVO.UpdateGoalVo
    ): Promise<GoalVO.GoalVo> => {
      const updateDto = GoalMapper.voToUpdateDto(updateVo);
      const dto = await goalService.update(id, updateDto as any);
      return GoalMapper.dtoToVo(dto);
    }
  );

  ipcMain.handle("/goal/delete", async (_, id: string) => {
    return await goalService.delete(id);
  });

  ipcMain.handle(
    "/goal/page",
    async (_, filter: any): Promise<GoalVO.GoalPageVo> => {
      const pageNum = Number(filter.pageNum) || 1;
      const pageSize = Number(filter.pageSize) || 10;
      const res = await goalService.page(pageNum, pageSize);
      return GoalMapper.dtoToPageVo(res.data, res.total, pageNum, pageSize);
    }
  );

  ipcMain.handle("/goal/batchDone", async (_, params: { idList: string[] }) => {
    return await goalService.batchDone(params.idList);
  });

  ipcMain.handle(
    "/goal/list",
    async (_, filter: any): Promise<GoalVO.GoalListVo> => {
      const list = await goalService.list(filter);
      return GoalMapper.dtoToListVo(list);
    }
  );

  ipcMain.handle(
    "/goal/getTree",
    async (): Promise<GoalVO.GoalVo[]> => {
      const list = await goalService.findTree();
      return (list || []).map((dto: any) => GoalMapper.dtoToVo(dto));
    }
  );

  ipcMain.handle(
    "/goal/findDetail",
    async (_, id: string): Promise<GoalVO.GoalVo> => {
      const dto = await goalService.findById(id);
      return GoalMapper.dtoToVo(dto);
    }
  );

  ipcMain.handle(
    "/goal/abandon",
    async (_, id: string): Promise<GoalVO.GoalVo> => {
      const dto = await goalService.update(id, { status: GoalStatus.ABANDONED });
      return GoalMapper.dtoToVo(dto as any);
    }
  );

  ipcMain.handle(
    "/goal/restore",
    async (_, id: string): Promise<GoalVO.GoalVo> => {
      const dto = await goalService.update(id, { status: GoalStatus.TODO });
      return GoalMapper.dtoToVo(dto as any);
    }
  );
}

