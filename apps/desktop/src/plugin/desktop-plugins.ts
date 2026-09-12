import type { PluginDescriptor, PluginManifest } from '@true-north/plugin-sdk';
import { growthManifest } from '@true-north/plugin-growth/plugin';
import { expenseManifest } from '@true-north/plugin-expense/plugin';
import { purchaseManifest } from '@true-north/plugin-purchase/plugin';
import { libraryManifest } from '@true-north/plugin-library/plugin';

export const FIRST_PARTY_PLUGIN_IDS = ['growth', 'expense', 'purchase', 'library'] as const;
export type FirstPartyPluginId = (typeof FIRST_PARTY_PLUGIN_IDS)[number];

export type FirstPartyPluginMeta = {
  pluginId: FirstPartyPluginId;
  packageName: `@true-north/plugin-${FirstPartyPluginId}`;
  wikiRoot: `packages/plugins/${FirstPartyPluginId}/wiki`;
  manifest: PluginManifest;
};

export const firstPartyPlugins = {
  growth: {
    pluginId: 'growth',
    packageName: '@true-north/plugin-growth',
    wikiRoot: 'packages/plugins/growth/wiki',
    manifest: growthManifest,
  },
  expense: {
    pluginId: 'expense',
    packageName: '@true-north/plugin-expense',
    wikiRoot: 'packages/plugins/expense/wiki',
    manifest: expenseManifest,
  },
  purchase: {
    pluginId: 'purchase',
    packageName: '@true-north/plugin-purchase',
    wikiRoot: 'packages/plugins/purchase/wiki',
    manifest: purchaseManifest,
  },
  library: {
    pluginId: 'library',
    packageName: '@true-north/plugin-library',
    wikiRoot: 'packages/plugins/library/wiki',
    manifest: libraryManifest,
  },
} as const satisfies Record<FirstPartyPluginId, FirstPartyPluginMeta>;

export const firstPartyWikiRoots = [
  { pluginId: 'host', root: 'packages/product-wiki/wiki' },
  ...FIRST_PARTY_PLUGIN_IDS.map((pluginId) => ({
    pluginId,
    root: firstPartyPlugins[pluginId].wikiRoot,
  })),
] as const;

export function firstPartyManifestLoaders(): PluginDescriptor[] {
  return FIRST_PARTY_PLUGIN_IDS.map((pluginId) => ({
    manifest: firstPartyPlugins[pluginId].manifest,
  }));
}
