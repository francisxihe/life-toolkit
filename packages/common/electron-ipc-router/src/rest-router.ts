import FindMyWay from "find-my-way";

export type RestHandlerCtx = {
  params: Record<string, string>;
  payload: any;
};

export type RestHandler = (ctx: RestHandlerCtx) => any | Promise<any>;

export type RouteDef = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string; // e.g. '/todo/create', '/todo/update/:id'
  handler: RestHandler;
};

export function createRestRouter() {
  const router = FindMyWay({ ignoreTrailingSlash: true });

  function registerRoutes(routes: RouteDef[]) {
    for (const r of routes) {
      // 将业务 handler 存入 store，匹配时从 store 取出调用
      router.on(
        r.method,
        r.path,
        (_req: any, _res: any, _params: any, _store: any) => {},
        r.handler
      );
    }
  }

  function normalizePath(p: string) {
    let s = String(p || "");
    if (!s.startsWith("/")) {
      // 兼容历史 IPC 事件名，如 'enums:getGoalTypes' → '/enums/getGoalTypes'
      s = "/" + s.replace(/:/g, "/");
    }
    return s;
  }

  async function dispatch(
    method: "POST" | "GET" | "PUT" | "DELETE",
    path: string,
    payload: any
  ) {
    const pathname = normalizePath(path);
    const matched = router.find(method, pathname) as any;

    if (!matched) {
      return {
        success: false,
        code: 404,
        message: `No route for ${method} ${pathname}`,
      };
    }
    const handler: RestHandler = matched.store;
    const params = matched.params || {};
    return await handler({ params, payload });
  }

  return { router, registerRoutes, dispatch };
}
