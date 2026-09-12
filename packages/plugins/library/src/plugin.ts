import { PLUGIN_API_VERSION, definePluginManifest } from '@true-north/plugin-contract';
import { version } from '../package.json';
import { LIBRARY_EXTRACT_ACTION } from './contract/index';

export const libraryManifest = definePluginManifest({
  pluginId: 'library',
  apiVersion: PLUGIN_API_VERSION,
  version,
  catalog: {
    nameKey: 'menu.library',
    descriptionKey: 'library.hub.description',
    categoryKey: 'plugins.category.builtin',
    keywords: ['bookmark', 'library', '收藏', '书签'],
    order: 40,
  },
  hostCapabilities: ['activity', 'storage', 'workbench', 'ipc'],
  contributions: {
    ipc: { library: { routePrefix: '/library' } },
    workbench: {
      actions: { extract: { id: LIBRARY_EXTRACT_ACTION } },
    },
    activity: {
      captureTypes: { bookmark: { type: 'library.bookmark' } },
      entityTypes: ['bookmark'],
      today: { bookmarks: { kind: 'metric', titleKey: 'plugins.hub.bookmarks', order: 30 } },
    },
    storage: { capability: 'self-managed', entityTypes: ['bookmark'] },
  },
});

export default libraryManifest;
