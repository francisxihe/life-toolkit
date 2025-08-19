import { ipcMain } from "electron";
import { habitService } from "./habit.service";
import { HabitStatus } from "./habit.entity";
import type { Habit as HabitVO } from "@life-toolkit/vo";
import { HabitMapper } from "@life-toolkit/business-server";
import type { RouteDef, RestHandlerCtx } from "../../../main/rest-router";

// REST 路由表
export const habitRestRoutes: RouteDef[] = [
  {
    method: "POST",
    path: "/habit/create",
    handler: async ({ payload }: RestHandlerCtx) =>
      HabitMapper.dtoToVo(
        await habitService.create(HabitMapper.voToCreateDto(payload) as any)
      ),
  },
  {
    method: "GET",
    path: "/habit/findAll",
    handler: async () =>
      (await habitService.findAll()).map((dto) => HabitMapper.dtoToItemVo(dto)),
  },
  {
    method: "GET",
    path: "/habit/findById/:id",
    handler: async ({ params }) =>
      HabitMapper.dtoToVo(await habitService.findById(params.id)),
  },

  {
    method: "GET",
    path: "/habit/findActiveHabits",
    handler: async () =>
      (await habitService.findActiveHabits()).map((dto) =>
        HabitMapper.dtoToItemVo(dto)
      ),
  },
  {
    method: "GET",
    path: "/habit/findByStatus/:status",
    handler: async ({ params }) =>
      (await habitService.findByStatus(params.status as any)).map((dto) =>
        HabitMapper.dtoToItemVo(dto)
      ),
  },

  {
    method: "POST",
    path: "/habit/updateStreak/:id",
    handler: async ({ params, payload }) =>
      await habitService.updateStreak(params.id, payload?.completed),
  },

  {
    method: "GET",
    path: "/habit/getStatistics/:id",
    handler: async ({ params }) =>
      await habitService.getHabitStatistics(params.id),
  },
  {
    method: "GET",
    path: "/habit/getOverallStatistics",
    handler: async () => await habitService.getOverallStatistics(),
  },

  {
    method: "POST",
    path: "/habit/pauseHabit",
    handler: async ({ payload }) => await habitService.pauseHabit(payload?.id),
  },
  {
    method: "POST",
    path: "/habit/resumeHabit",
    handler: async ({ payload }) => await habitService.resumeHabit(payload?.id),
  },
  {
    method: "POST",
    path: "/habit/completeHabit",
    handler: async ({ payload }) =>
      await habitService.completeHabit(payload?.id),
  },

  {
    method: "PUT",
    path: "/habit/update/:id",
    handler: async ({ params, payload }) =>
      HabitMapper.dtoToVo(
        await habitService.update(
          params.id,
          HabitMapper.voToUpdateDto(payload) as any
        )
      ),
  },

  {
    method: "DELETE",
    path: "/habit/delete/:id",
    handler: async ({ params }) => await habitService.delete(params.id),
  },

  {
    method: "GET",
    path: "/habit/page",
    handler: async ({ payload }) => {
      const pageNum = Number(payload?.pageNum) || 1;
      const pageSize = Number(payload?.pageSize) || 10;
      const res = await habitService.page(pageNum, pageSize);
      return HabitMapper.dtoToPageVo(res.data, res.total, pageNum, pageSize);
    },
  },
  {
    method: "GET",
    path: "/habit/list",
    handler: async () => HabitMapper.dtoToListVo(await habitService.list()),
  },

  {
    method: "GET",
    path: "/habit/findByIdWithRelations/:id",
    handler: async ({ params }) =>
      await habitService.findByIdWithRelations(params.id),
  },

  {
    method: "GET",
    path: "/habit/findByGoalId/:goalId",
    handler: async ({ params }) =>
      (await habitService.findByGoalId(params.goalId)).map((dto) =>
        HabitMapper.dtoToItemVo(dto)
      ),
  },

  {
    method: "GET",
    path: "/habit/getHabitTodos/:id",
    handler: async ({ params }) => await habitService.getHabitTodos(params.id),
  },
  {
    method: "GET",
    path: "/habit/getHabitAnalytics/:id",
    handler: async ({ params }) =>
      await habitService.getHabitAnalytics(params.id),
  },

  {
    method: "POST",
    path: "/habit/batchDone",
    handler: async ({ payload }) =>
      await Promise.all(
        (payload?.idList ?? []).map((id: string) =>
          habitService.update(id, { status: HabitStatus.COMPLETED })
        )
      ),
  },

  {
    method: "POST",
    path: "/habit/abandon/:id",
    handler: async ({ params }) =>
      HabitMapper.dtoToVo(
        (await habitService.update(params.id, {
          status: HabitStatus.PAUSED,
        })) as any
      ),
  },
  {
    method: "POST",
    path: "/habit/restore/:id",
    handler: async ({ params }) =>
      HabitMapper.dtoToVo(
        (await habitService.update(params.id, {
          status: HabitStatus.ACTIVE,
        })) as any
      ),
  },

  {
    method: "POST",
    path: "/habit/pause",
    handler: async ({ payload }) => await habitService.pauseHabit(payload?.id),
  },
  {
    method: "POST",
    path: "/habit/resume",
    handler: async ({ payload }) => await habitService.resumeHabit(payload?.id),
  },
];
