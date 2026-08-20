import electron from 'electron';
import { labChannel } from '@true-north/dev-lab';
import { clearDevTrace, isDevTraceEnabled, runRestTrace, snapshotDevTrace } from '@true-north/dev-lab/collector';

const { ipcMain } = electron;

let restHookInstalled = false;
let labIpcInstalled = false;

export function installRestTraceHook(): void {
  if (!isDevTraceEnabled() || restHookInstalled) return;
  const ipc = ipcMain as typeof ipcMain & { __devTraceRestWrapped?: boolean };
  if (ipc.__devTraceRestWrapped) {
    restHookInstalled = true;
    return;
  }
  restHookInstalled = true;
  ipc.__devTraceRestWrapped = true;
  const originalHandle = ipcMain.handle.bind(ipcMain);
  ipcMain.handle = ((channel: string, listener: (...args: any[]) => any) => {
    if (channel !== 'REST') return originalHandle(channel, listener);
    return originalHandle(channel, async (event, req) => {
      return runRestTrace(req || {}, () => listener(event, req));
    });
  }) as typeof ipcMain.handle;
}

export function installLabPanelIpc(): void {
  if (!isDevTraceEnabled() || labIpcInstalled) return;
  const ipc = ipcMain as typeof ipcMain & { __devTraceLabIpc?: boolean };
  if (ipc.__devTraceLabIpc) {
    labIpcInstalled = true;
    return;
  }
  labIpcInstalled = true;
  ipc.__devTraceLabIpc = true;
  ipcMain.handle(labChannel.snapshot, () => snapshotDevTrace());
  ipcMain.handle(labChannel.clear, () => {
    clearDevTrace();
    return snapshotDevTrace();
  });
}
