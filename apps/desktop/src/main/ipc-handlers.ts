import { ipcMain } from "electron";
import { todoRestRoutes } from "../database/growth/todo/todo.controller";
import { createRestRouter } from "./rest-router";
// import { userRestRoutes } from '../database/users/user.controller';
import { goalRestRoutes } from "../database/growth/goal/goal.controller";
import { taskRestRoutes } from "../database/growth/task/task.controller";
import { habitRestRoutes } from "../database/growth/habit/habit.controller";
import { enumRestRoutes } from "../database/enums.controller";

/**
 * 注册所有 IPC 处理器
 */
export function registerIpcHandlers(): void {
  // 创建统一 REST 路由器并注册各模块路由
  const { registerRoutes, dispatch } = createRestRouter();
  registerRoutes([
    ...todoRestRoutes,
    ...goalRestRoutes,
    ...taskRestRoutes,
    ...habitRestRoutes,
    // ...userRestRoutes,
    ...enumRestRoutes,
  ]);

  // 统一 REST 分发器
  ipcMain.handle(
    "REST",
    async (
      _event,
      req: {
        method: "POST" | "GET" | "PUT" | "DELETE";
        path: string;
        payload: any;
      }
    ) => {
      const method = req?.method || "GET";
      const path = String(req?.path || "");
      const payload = req?.payload;
      return await dispatch(method, path, payload);
    }
  );
}
