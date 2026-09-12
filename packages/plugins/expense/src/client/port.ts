import type { PluginIpcPort } from '@true-north/plugin-sdk';

let ipc: PluginIpcPort | null = null;

export function bindPluginIpc(port: PluginIpcPort) {
  ipc = port;
}

export function pluginIpc(): PluginIpcPort {
  if (!ipc) throw new Error('Plugin IPC is not bound');
  return ipc;
}
