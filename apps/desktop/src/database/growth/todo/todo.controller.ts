import { ipcMain } from "electron";
import { todoService } from "./todo.service";
import type { Todo as TodoVO } from "@life-toolkit/vo";
import { TodoMapper } from "@life-toolkit/business-server";
import type { RouteDef, RestHandlerCtx } from "../../../main/rest-router";

/**
 * 注册待办事项相关的 IPC 处理器
 */
export function registerTodoIpcHandlers(): void {
  // 待办事项相关
  ipcMain.handle(
    "/todo/create",
    async (_, createVo: TodoVO.CreateTodoVo): Promise<TodoVO.TodoVo> => {
      const createDto = TodoMapper.voToCreateDto(createVo);
      const dto = await todoService.createTodo(createDto as any);
      return TodoMapper.dtoToVo(dto);
    }
  );

  ipcMain.handle("/todo/findAll", async (): Promise<TodoVO.TodoVo[]> => {
    const list = await todoService.findAll();
    return TodoMapper.dtoToVoList(list);
  });

  ipcMain.handle(
    "/todo/findById",
    async (_, id: string): Promise<TodoVO.TodoVo> => {
      const dto = await todoService.findById(id);
      return TodoMapper.dtoToVo(dto);
    }
  );

  ipcMain.handle(
    "/todo/findByStatus",
    async (_, status: any): Promise<TodoVO.TodoVo[]> => {
      const list = await todoService.findByStatus(status);
      return TodoMapper.dtoToVoList(list);
    }
  );

  ipcMain.handle("/todo/findTodayTodos", async (): Promise<TodoVO.TodoVo[]> => {
    const list = await todoService.findTodayTodos();
    return TodoMapper.dtoToVoList(list);
  });

  ipcMain.handle(
    "/todo/findOverdueTodos",
    async (): Promise<TodoVO.TodoVo[]> => {
      const list = await todoService.findOverdueTodos();
      return TodoMapper.dtoToVoList(list);
    }
  );

  ipcMain.handle(
    "/todo/findHighImportanceTodos",
    async (): Promise<TodoVO.TodoVo[]> => {
      const list = await todoService.findHighImportanceTodos();
      return TodoMapper.dtoToVoList(list);
    }
  );

  ipcMain.handle("/todo/updateStatus", async (_, id: string, status: any) => {
    return await todoService.updateStatus(id, status);
  });

  ipcMain.handle(
    "/todo/update",
    async (
      _,
      id: string,
      updateVo: TodoVO.UpdateTodoVo
    ): Promise<TodoVO.TodoVo> => {
      console.log("updateVo", _, id, updateVo);
      const updateDto = TodoMapper.voToUpdateDto(updateVo);
      const dto = await todoService.update(id, updateDto as any);
      return TodoMapper.dtoToVo(dto);
    }
  );

  ipcMain.handle("/todo/delete", async (_, id: string) => {
    return await todoService.delete(id);
  });

  ipcMain.handle(
    "/todo/page",
    async (_, filter: any): Promise<TodoVO.TodoPageVo> => {
      const pageNum = Number(filter.pageNum) || 1;
      const pageSize = Number(filter.pageSize) || 10;
      const res = await todoService.page(pageNum, pageSize);
      return TodoMapper.dtoToPageVo(
        res.data,
        res.total,
        res.pageNum,
        res.pageSize
      );
    }
  );

  ipcMain.handle(
    "/todo/list",
    async (_, filter: any): Promise<TodoVO.TodoListVo> => {
      const res: any = await todoService.list(filter ?? {});
      if (Array.isArray(res)) {
        return TodoMapper.dtoToListVo(res);
      }
      return res as TodoVO.TodoListVo;
    }
  );

  ipcMain.handle("/todo/batchDone", async (_, params: { idList: string[] }) => {
    return await todoService.batchDone(params.idList);
  });

  ipcMain.handle("/todo/abandon", async (_, id: string) => {
    return await todoService.abandon(id);
  });

  ipcMain.handle("/todo/restore", async (_, id: string) => {
    return await todoService.restore(id);
  });

  ipcMain.handle("/todo/done", async (_, id: string) => {
    return await todoService.done(id);
  });

  ipcMain.handle("/todo/getStatistics", async () => {
    return await todoService.getStatistics();
  });
}

// REST 路由表（与现有 IPC 路由等价，便于统一从 REST 分发）
export const todoRestRoutes: RouteDef[] = [
  {
    method: "POST",
    path: "/todo/create",
    handler: async ({
      payload,
    }: {
      payload: TodoVO.CreateTodoVo;
    }) => {
      const createDto = TodoMapper.voToCreateDto(payload);
      const dto = await todoService.createTodo(createDto as any);
      return TodoMapper.dtoToVo(dto);
    },
  },
  {
    method: "GET",
    path: "/todo/findAll",
    handler: async () => TodoMapper.dtoToVoList(await todoService.findAll()),
  },

  {
    method: "GET",
    path: "/todo/findById/:id",
    handler: async ({ params }) =>
      TodoMapper.dtoToVo(await todoService.findById(params.id)),
  },

  {
    method: "GET",
    path: "/todo/findByStatus",
    handler: async ({ payload }) =>
      TodoMapper.dtoToVoList(await todoService.findByStatus(payload?.status)),
  },
  {
    method: "GET",
    path: "/todo/findByStatus/:status",
    handler: async ({ params }) =>
      TodoMapper.dtoToVoList(
        await todoService.findByStatus(params.status as any)
      ),
  },

  {
    method: "GET",
    path: "/todo/findTodayTodos",
    handler: async () =>
      TodoMapper.dtoToVoList(await todoService.findTodayTodos()),
  },
  {
    method: "GET",
    path: "/todo/findOverdueTodos",
    handler: async () =>
      TodoMapper.dtoToVoList(await todoService.findOverdueTodos()),
  },
  {
    method: "GET",
    path: "/todo/findHighImportanceTodos",
    handler: async () =>
      TodoMapper.dtoToVoList(await todoService.findHighImportanceTodos()),
  },

  {
    method: "PUT",
    path: "/todo/updateStatus",
    handler: async ({ payload }) =>
      await todoService.updateStatus(payload?.id, payload?.status),
  },
  {
    method: "PUT",
    path: "/todo/updateStatus/:id",
    handler: async ({ params, payload }) =>
      await todoService.updateStatus(params.id, payload?.status),
  },
  {
    method: "PUT",
    path: "/todo/update/:id",
    handler: async ({ params, payload }) => {
      const updateDto = TodoMapper.voToUpdateDto(
        (payload?.updateVo ?? payload) as TodoVO.UpdateTodoVo
      );
      const dto = await todoService.update(params.id, updateDto as any);
      return TodoMapper.dtoToVo(dto);
    },
  },
  {
    method: "DELETE",
    path: "/todo/delete/:id",
    handler: async ({ params }) => await todoService.delete(params.id),
  },

  {
    method: "GET",
    path: "/todo/page",
    handler: async ({ payload }) => {
      const pageNum = Number(payload?.pageNum) || 1;
      const pageSize = Number(payload?.pageSize) || 10;
      const res = await todoService.page(pageNum, pageSize);
      return TodoMapper.dtoToPageVo(
        res.data,
        res.total,
        res.pageNum ?? pageNum,
        res.pageSize ?? pageSize
      );
    },
  },

  {
    method: "GET",
    path: "/todo/list",
    handler: async ({ payload }) => {
      const res: any = await todoService.list(payload ?? {});
      return Array.isArray(res) ? TodoMapper.dtoToListVo(res) : res;
    },
  },

  {
    method: "POST",
    path: "/todo/batchDone",
    handler: async ({ payload }) =>
      await todoService.batchDone(payload?.idList ?? []),
  },
  {
    method: "POST",
    path: "/todo/abandon/:id",
    handler: async ({ params }) => await todoService.abandon(params.id),
  },
  {
    method: "POST",
    path: "/todo/restore/:id",
    handler: async ({ params }) => await todoService.restore(params.id),
  },
  {
    method: "POST",
    path: "/todo/done/:id",
    handler: async ({ params }) => await todoService.done(params.id),
  },
  {
    method: "GET",
    path: "/todo/getStatistics",
    handler: async () => await todoService.getStatistics(),
  },
];
