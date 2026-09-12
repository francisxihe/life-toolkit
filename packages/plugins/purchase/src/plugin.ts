import { PLUGIN_API_VERSION, definePluginManifest } from '@true-north/plugin-contract';
import { version } from '../package.json';

export const purchaseManifest = definePluginManifest({
  pluginId: 'purchase',
  apiVersion: PLUGIN_API_VERSION,
  version,
  catalog: {
    nameKey: 'menu.purchase',
    descriptionKey: 'purchase.hub.description',
    categoryKey: 'plugins.category.builtin',
    keywords: ['purchase', 'buy', '采购', '待购'],
    order: 30,
  },
  hostCapabilities: ['activity', 'storage', 'ipc'],
  contributions: {
    ipc: { purchase: { routePrefix: '/purchase' } },
    activity: {
      captureTypes: { item: { type: 'purchase.item' } },
      entityTypes: ['purchase'],
      today: {
        pending: { kind: 'metric', titleKey: 'plugins.hub.pendingPurchases', order: 20 },
        purchases: { kind: 'list', titleKey: 'menu.purchase', order: 40 },
      },
    },
    storage: { capability: 'self-managed', entityTypes: ['purchase'] },
  },
});

export default purchaseManifest;
