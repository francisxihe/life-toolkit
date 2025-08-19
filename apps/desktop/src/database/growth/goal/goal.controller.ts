import { ipcMain } from "electron";
import { goalService } from "./goal.service";
import { GoalStatus } from "./goal.entity";
import type { Goal as GoalVO } from "@life-toolkit/vo";
import { GoalMapper } from "@life-toolkit/business-server";
import type { RouteDef, RestHandlerCtx } from "../../../main/rest-router";

// REST 路由表
export const goalRestRoutes: RouteDef[] = [
  {
    method: "POST",
    path: "/goal/create",
    handler: async ({ payload }: RestHandlerCtx) => {
      const dto = await goalService.create(
        GoalMapper.voToCreateDto(payload) as any
      );
      return GoalMapper.dtoToItemVo(dto);
    },
  },
  {
    method: "GET",
    path: "/goal/findAll",
    handler: async () => GoalMapper.dtoToVoList(await goalService.findAll()),
  },
  {
    method: "GET",
    path: "/goal/findById/:id",
    handler: async ({ params }) =>
      GoalMapper.dtoToVo(await goalService.findById(params.id)),
  },

  {
    method: "GET",
    path: "/goal/tree",
    handler: async () =>
      (await goalService.findTree()).map((dto: any) => GoalMapper.dtoToVo(dto)),
  },
  {
    method: "GET",
    path: "/goal/findRoots",
    handler: async () =>
      (await goalService.findRoots()).map((dto: any) =>
        GoalMapper.dtoToVo(dto)
      ),
  },

  {
    method: "GET",
    path: "/goal/findChildren",
    handler: async ({ payload }) =>
      (await goalService.findChildren(payload?.parentId)).map((dto: any) =>
        GoalMapper.dtoToVo(dto)
      ),
  },
  {
    method: "GET",
    path: "/goal/findChildren/:parentId",
    handler: async ({ params }) =>
      (await goalService.findChildren(params.parentId)).map((dto: any) =>
        GoalMapper.dtoToVo(dto)
      ),
  },

  {
    method: "GET",
    path: "/goal/findByType/:type",
    handler: async ({ params }) =>
      GoalMapper.dtoToVoList(await goalService.findByType(params.type as any)),
  },

  {
    method: "GET",
    path: "/goal/findByStatus/:status",
    handler: async ({ params }) =>
      GoalMapper.dtoToVoList(
        await goalService.findByStatus(params.status as any)
      ),
  },

  {
    method: "PUT",
    path: "/goal/update/:id",
    handler: async ({ params, payload }) =>
      GoalMapper.dtoToVo(
        await goalService.update(
          params.id,
          GoalMapper.voToUpdateDto(payload) as any
        )
      ),
  },

  {
    method: "DELETE",
    path: "/goal/delete/:id",
    handler: async ({ params }) => await goalService.delete(params.id),
  },

  {
    method: "GET",
    path: "/goal/page",
    handler: async ({ payload }) => {
      const pageNum = Number(payload?.pageNum) || 1;
      const pageSize = Number(payload?.pageSize) || 10;
      const res = await goalService.page(pageNum, pageSize);
      return GoalMapper.dtoToPageVo(res.data, res.total, pageNum, pageSize);
    },
  },

  {
    method: "POST",
    path: "/goal/batchDone",
    handler: async ({ payload }) =>
      await goalService.batchDone(payload?.idList ?? []),
  },

  {
    method: "GET",
    path: "/goal/list",
    handler: async ({ payload }) =>
      GoalMapper.dtoToListVo(await goalService.list(payload)),
  },
  {
    method: "GET",
    path: "/goal/getTree",
    handler: async () =>
      (await goalService.findTree()).map((dto: any) => GoalMapper.dtoToVo(dto)),
  },
  {
    method: "GET",
    path: "/goal/findDetail/:id",
    handler: async ({ params }) =>
      GoalMapper.dtoToVo(await goalService.findById(params.id)),
  },

  {
    method: "POST",
    path: "/goal/abandon/:id",
    handler: async ({ params }) =>
      GoalMapper.dtoToVo(
        (await goalService.update(params.id, {
          status: GoalStatus.ABANDONED,
        })) as any
      ),
  },
  {
    method: "POST",
    path: "/goal/restore/:id",
    handler: async ({ params }) =>
      GoalMapper.dtoToVo(
        (await goalService.update(params.id, {
          status: GoalStatus.TODO,
        })) as any
      ),
  },
];
