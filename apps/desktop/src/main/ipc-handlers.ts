import { registerIpcHandlers } from 'electron-ipc-restful';
import { installLabIpc, installRestHook } from './dev-trace';
import { BrowserController } from '../service/browser';
import { collectIpcControllers } from '../plugin/registry';

export function initIpcRouter(): void {
  installRestHook();
  installLabIpc();
  const pluginControllers = collectIpcControllers().map((item) => item.controller);
  const seen = new Set<string>();
  for (const item of collectIpcControllers()) {
    if (seen.has(item.routePrefix)) {
      throw new Error(`重复 IPC 路由: ${item.routePrefix}`);
    }
    seen.add(item.routePrefix);
  }
  registerIpcHandlers({
    controllers: [...pluginControllers, BrowserController],
  });
}
