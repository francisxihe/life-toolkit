import {
  closePluginSqliteStore,
  openPluginSqliteStore,
  type HostStorageRuntime,
} from '@true-north/plugin-sdk/main';
import type { PluginSpace } from '@true-north/plugin-sdk';
import { purchaseEntities } from './entities';

export const PLUGIN_ID = 'purchase' as const;

let runtime: HostStorageRuntime | undefined;

export async function activateStorage(space: PluginSpace) {
  runtime = await openPluginSqliteStore({
    pluginId: PLUGIN_ID,
    space,
    entities: purchaseEntities,
  });
  return runtime;
}

export async function disposeStorage() {
  await closePluginSqliteStore(runtime);
  runtime = undefined;
}

export function store(): HostStorageRuntime {
  if (!runtime) throw new Error('Purchase storage is not open');
  return runtime;
}
