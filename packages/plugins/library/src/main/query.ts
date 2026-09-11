import { createRepositoryQueryPort } from '@true-north/plugin-sdk/host';
import type { PluginQueryPort } from '@true-north/plugin-sdk';
import { Bookmark } from './service/bookmark.entity';
import { PLUGIN_ID } from './storage';

export const libraryQuery: PluginQueryPort = createRepositoryQueryPort(PLUGIN_ID, [
  { entityType: 'bookmark', entity: Bookmark, label: (row) => String(row.title || row.id) },
]);
