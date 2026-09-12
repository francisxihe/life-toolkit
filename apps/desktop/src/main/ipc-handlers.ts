import { buildRoutesFromControllers, registerIpcHandlers } from 'electron-ipc-restful';
import { installLabIpc, installRestHook } from './dev-trace';
import { BrowserController } from '../service/browser';
import { collectIpcControllers } from '../plugin/host';

export function initIpcRouter(): void {
  installRestHook();
  installLabIpc();
  const pluginControllers = collectIpcControllers();
  const seen = new Set<string>();
  for (const item of pluginControllers) {
    if (seen.has(item.routePrefix)) {
      throw new Error(`重复 IPC 路由: ${item.routePrefix}`);
    }
    seen.add(item.routePrefix);
  }

  const pluginRoutes = pluginControllers.flatMap((item) =>
    buildRoutesFromControllers([item.controller]).map((route) => ({
      ...route,
      path: `${item.routePrefix}${route.path}`,
    })),
  );

  registerIpcHandlers({
    controllers: [BrowserController],
    routes: pluginRoutes,
  });
}
