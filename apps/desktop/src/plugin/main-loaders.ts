import type { PluginDescriptor } from '@true-north/plugin-sdk';
import { FIRST_PARTY_PLUGIN_IDS, firstPartyPlugins, type FirstPartyPluginId } from './desktop-plugins';

export const firstPartyMainLoaders = {
  growth: () => import('@true-north/plugin-growth/main'),
  expense: () => import('@true-north/plugin-expense/main'),
  purchase: () => import('@true-north/plugin-purchase/main'),
  library: () => import('@true-north/plugin-library/main'),
} as const satisfies Record<FirstPartyPluginId, NonNullable<PluginDescriptor['loadMain']>>;

export function firstPartyMainDescriptors(): PluginDescriptor[] {
  return FIRST_PARTY_PLUGIN_IDS.map((pluginId) => ({
    manifest: firstPartyPlugins[pluginId].manifest,
    loadMain: firstPartyMainLoaders[pluginId],
  }));
}
