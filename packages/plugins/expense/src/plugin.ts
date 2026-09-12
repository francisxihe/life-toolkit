import { PLUGIN_API_VERSION, definePluginManifest } from '@true-north/plugin-contract';
import { version } from '../package.json';

export const expenseManifest = definePluginManifest({
  pluginId: 'expense',
  apiVersion: PLUGIN_API_VERSION,
  version,
  catalog: {
    nameKey: 'menu.expense',
    descriptionKey: 'expense.hub.description',
    categoryKey: 'plugins.category.builtin',
    keywords: ['expense', 'budget', 'transaction', '记账', '预算', '账单'],
    order: 20,
  },
  hostCapabilities: ['activity', 'storage', 'ipc'],
  contributions: {
    ipc: { expense: { routePrefix: '/expense' } },
    activity: {
      captureTypes: { transaction: { type: 'expense.transaction' } },
      entityTypes: ['transaction'],
      today: { spent: { kind: 'metric', titleKey: 'plugins.hub.spent', order: 10 } },
    },
    storage: { capability: 'self-managed', entityTypes: ['transaction', 'budget'] },
  },
});

export default expenseManifest;
