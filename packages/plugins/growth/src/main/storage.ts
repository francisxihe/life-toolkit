import {
  closePluginSqliteStore,
  openPluginSqliteStore,
  type HostStorageRuntime,
} from '@true-north/plugin-sdk/main';
import type { PluginSpace } from '@true-north/plugin-sdk';
import { growthEntities } from './entities';
import { growthMigrations } from './migrations';

export const PLUGIN_ID = 'growth' as const;

let runtime: HostStorageRuntime | undefined;

export async function activateStorage(space: PluginSpace) {
  runtime = await openPluginSqliteStore({
    pluginId: PLUGIN_ID,
    space,
    entities: growthEntities,
    migrations: growthMigrations,
    extraLegacyTables: ['todo_repeat', 'habit_goal'],
  });
  return runtime;
}

export async function disposeStorage() {
  await closePluginSqliteStore(runtime);
  runtime = undefined;
}

export function store(): HostStorageRuntime {
  if (!runtime) throw new Error('Growth storage is not open');
  return runtime;
}
