import type { PluginModuleLoader } from '@true-north/plugin-sdk';
import { growthManifest } from '@true-north/plugin-growth/manifest';
import { expenseManifest } from '@true-north/plugin-expense/manifest';
import { purchaseManifest } from '@true-north/plugin-purchase/manifest';
import { libraryManifest } from '@true-north/plugin-library/manifest';

export const firstPartyPluginLoaders: PluginModuleLoader[] = [
  {
    manifest: growthManifest,
    loadMain: () => import('@true-north/plugin-growth/main'),
  },
  {
    manifest: expenseManifest,
    loadMain: () => import('@true-north/plugin-expense/main'),
  },
  {
    manifest: purchaseManifest,
    loadMain: () => import('@true-north/plugin-purchase/main'),
  },
  {
    manifest: libraryManifest,
    loadMain: () => import('@true-north/plugin-library/main'),
  },
];

export const firstPartyWikiRoots = [
  { pluginId: 'host', root: 'packages/product-wiki/wiki' },
  { pluginId: 'growth', root: 'packages/plugins/growth/wiki' },
  { pluginId: 'expense', root: 'packages/plugins/expense/wiki' },
  { pluginId: 'purchase', root: 'packages/plugins/purchase/wiki' },
  { pluginId: 'library', root: 'packages/plugins/library/wiki' },
] as const;
