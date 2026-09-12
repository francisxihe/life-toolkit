import {
  closePluginSqliteStore,
  openPluginSqliteStore,
  type HostStorageRuntime,
} from '@true-north/plugin-sdk/main';
import type { PluginSpace } from '@true-north/plugin-sdk';
import { libraryEntities } from './entities';

export const PLUGIN_ID = 'library' as const;

let runtime: HostStorageRuntime | undefined;

export async function activateStorage(space: PluginSpace) {
  runtime = await openPluginSqliteStore({
    pluginId: PLUGIN_ID,
    space,
    entities: libraryEntities,
  });
  return runtime;
}

export async function disposeStorage() {
  await closePluginSqliteStore(runtime);
  runtime = undefined;
}

export function store(): HostStorageRuntime {
  if (!runtime) throw new Error('Library storage is not open');
  return runtime;
}
