import { closePluginSqliteStore, openPluginSqliteStore, pluginStore } from '@true-north/plugin-sdk/host';
import type { HostStorageRuntime } from '@true-north/plugin-sdk/host';
import type { PluginSpace } from '@true-north/plugin-sdk';
import { growthEntities } from './entities';
import { growthMigrations } from './migrations';

export const PLUGIN_ID = 'growth' as const;

export async function activateStorage(space: PluginSpace) {
  await openPluginSqliteStore({
    pluginId: PLUGIN_ID,
    space,
    entities: growthEntities,
    migrations: growthMigrations,
    extraLegacyTables: ['todo_repeat', 'habit_goal'],
  });
}

export async function disposeStorage() {
  await closePluginSqliteStore(PLUGIN_ID);
}

export function store(): HostStorageRuntime {
  return pluginStore(PLUGIN_ID);
}
