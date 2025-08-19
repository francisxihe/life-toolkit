import { ipcMain } from "electron";
import { taskService } from "./task.service";
import { TaskStatus } from "./task.entity";
import type { Task as TaskVO } from "@life-toolkit/vo";
import { TaskMapper } from "@life-toolkit/business-server";
import type { RouteDef, RestHandlerCtx } from "../../../main/rest-router";
// REST 路由表（与现有 IPC 路由等价）
export const taskRestRoutes: RouteDef[] = [
  {
    method: "POST",
    path: "/task/create",
    handler: async ({ payload }: RestHandlerCtx) =>
      TaskMapper.dtoToVo(
        await taskService.create(TaskMapper.voToCreateDto(payload) as any)
      ),
  },
  {
    method: "GET",
    path: "/task/findAll",
    handler: async () => TaskMapper.dtoToVoList(await taskService.findAll()),
  },
  {
    method: "GET",
    path: "/task/findById/:id",
    handler: async ({ params }) =>
      TaskMapper.dtoToVo(await taskService.findById(params.id)),
  },

  {
    method: "GET",
    path: "/task/findTree",
    handler: async () =>
      (await taskService.findTree()).map((e: any) =>
        TaskMapper.dtoToVo(TaskMapper.entityToDto(e))
      ),
  },
  {
    method: "GET",
    path: "/task/findByGoalId/:goalId",
    handler: async ({ params }) =>
      TaskMapper.dtoToVoList(await taskService.findByGoalId(params.goalId)),
  },
  {
    method: "GET",
    path: "/task/findByStatus/:status",
    handler: async ({ params }) =>
      TaskMapper.dtoToVoList(
        await taskService.findByStatus(params.status as any)
      ),
  },

  {
    method: "POST",
    path: "/task/updateStatus/:id",
    handler: async ({ params, payload }) =>
      await taskService.updateStatus(params.id, payload?.status),
  },

  {
    method: "PUT",
    path: "/task/update/:id",
    handler: async ({ params, payload }) =>
      TaskMapper.dtoToVo(
        await taskService.update(
          params.id,
          TaskMapper.voToUpdateDto(payload) as any
        )
      ),
  },

  {
    method: "DELETE",
    path: "/task/delete/:id",
    handler: async ({ params }) => await taskService.delete(params.id),
  },

  {
    method: "GET",
    path: "/task/page",
    handler: async ({ payload }) => {
      const pageNum = Number(payload?.pageNum) || 1;
      const pageSize = Number(payload?.pageSize) || 10;
      const res = await taskService.page(pageNum, pageSize);
      return TaskMapper.dtoToPageVo(res.data, res.total, pageNum, pageSize);
    },
  },

  {
    method: "GET",
    path: "/task/list",
    handler: async () => TaskMapper.dtoToListVo(await taskService.list()),
  },
  {
    method: "GET",
    path: "/task/taskWithTrackTime/:id",
    handler: async ({ params }) =>
      TaskMapper.dtoToWithTrackTimeVo(
        await taskService.taskWithTrackTime(params.id)
      ),
  },

  {
    method: "POST",
    path: "/task/batchDone",
    handler: async ({ payload }) =>
      (
        await Promise.all(
          (payload?.idList ?? []).map((id: string) =>
            taskService.update(id, { status: TaskStatus.DONE })
          )
        )
      ).map((dto) => TaskMapper.dtoToVo(dto as any)),
  },

  {
    method: "POST",
    path: "/task/abandon/:id",
    handler: async ({ params }) =>
      TaskMapper.dtoToVo(
        (await taskService.update(params.id, {
          status: TaskStatus.ABANDONED,
        })) as any
      ),
  },
  {
    method: "POST",
    path: "/task/restore/:id",
    handler: async ({ params }) =>
      TaskMapper.dtoToVo(
        (await taskService.update(params.id, {
          status: TaskStatus.TODO,
        })) as any
      ),
  },
];
