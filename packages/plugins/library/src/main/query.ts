import { createRepositoryQueryPort, type HostStorageRuntime } from '@true-north/plugin-sdk/main';
import type { PluginQueryPort } from '@true-north/plugin-sdk';
import { Bookmark } from './service/bookmark.entity';
import { PLUGIN_ID } from './storage';

export function createLibraryQuery(runtime: HostStorageRuntime): PluginQueryPort {
  return createRepositoryQueryPort(PLUGIN_ID, runtime, [
    { entityType: 'bookmark', entity: Bookmark, label: (row) => String(row.title || row.id) },
  ]);
}
