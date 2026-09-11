import { PLUGIN_API_VERSION, type PluginManifest } from '@true-north/plugin-sdk';
import { version } from '../package.json';

export const expenseManifest: PluginManifest = {
  pluginId: 'expense',
  apiVersion: PLUGIN_API_VERSION,
  version,
  contributions: {
    ipc: [{ id: 'expense', routePrefix: '/expense' }],
    activity: { captureTypes: ['expense.transaction'], entityTypes: ['transaction'], today: true },
    storage: {
      entityTypes: ['transaction', 'budget'],
    },
  },
};

export default expenseManifest;
