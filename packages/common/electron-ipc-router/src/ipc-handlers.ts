import { ipcMain } from "electron";
import { createRestRouter, type RouteDef } from "./rest-router";
import { buildRoutesFromControllers } from "./rest-decorators";

/**
 * 注册所有 IPC 处理器
 */
export type RegisterIpcHandlersOptions = {
  /** 通过装饰器的控制器类或实例列表，可为空 */
  controllers?: Array<any>;
  /** 直接提供的路由定义列表，可为空 */
  routes?: RouteDef[];
  /** 绑定的 IPC channel，默认 "REST" */
  channel?: string;
};

export function registerIpcHandlers(
  options: RegisterIpcHandlersOptions = {}
): void {
  const { controllers = [], routes = [], channel = "REST" } = options;

  // 创建统一 REST 路由器并注册各模块路由
  const { registerRoutes, dispatch } = createRestRouter();
  const decoratedRoutes = controllers.length
    ? buildRoutesFromControllers(controllers)
    : [];

  registerRoutes([...decoratedRoutes, ...routes]);

  // 统一 REST 分发器
  ipcMain.handle(
    channel,
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
