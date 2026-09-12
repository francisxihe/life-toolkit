import {
  closePluginSqliteStore,
  openPluginSqliteStore,
  type HostStorageRuntime,
} from '@true-north/plugin-sdk/main';
import type { PluginSpace } from '@true-north/plugin-sdk';
import { expenseEntities } from './entities';

export const PLUGIN_ID = 'expense' as const;

let runtime: HostStorageRuntime | undefined;

export async function activateStorage(space: PluginSpace) {
  runtime = await openPluginSqliteStore({
    pluginId: PLUGIN_ID,
    space,
    entities: expenseEntities,
  });
  return runtime;
}

export async function disposeStorage() {
  await closePluginSqliteStore(runtime);
  runtime = undefined;
}

export function store(): HostStorageRuntime {
  if (!runtime) throw new Error('Expense storage is not open');
  return runtime;
}
