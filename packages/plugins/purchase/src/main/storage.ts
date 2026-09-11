import { closePluginSqliteStore, openPluginSqliteStore, pluginStore } from '@true-north/plugin-sdk/host';
import type { HostStorageRuntime } from '@true-north/plugin-sdk/host';
import type { PluginSpace } from '@true-north/plugin-sdk';
import { purchaseEntities } from './entities';

export const PLUGIN_ID = 'purchase' as const;

export async function activateStorage(space: PluginSpace) {
  await openPluginSqliteStore({
    pluginId: PLUGIN_ID,
    space,
    entities: purchaseEntities,
  });
}

export async function disposeStorage() {
  await closePluginSqliteStore(PLUGIN_ID);
}

export function store(): HostStorageRuntime {
  return pluginStore(PLUGIN_ID);
}
