import { PLUGIN_API_VERSION, type PluginManifest } from '@true-north/plugin-sdk';
import { version } from '../package.json';

export const purchaseManifest: PluginManifest = {
  pluginId: 'purchase',
  apiVersion: PLUGIN_API_VERSION,
  version,
  contributions: {
    ipc: [{ id: 'purchase', routePrefix: '/purchase' }],
    activity: { captureTypes: ['purchase.item'], entityTypes: ['purchase'], today: true },
    storage: {
      entityTypes: ['purchase'],
    },
  },
};

export default purchaseManifest;
