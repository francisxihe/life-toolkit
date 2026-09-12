import type { PluginDescriptor } from '@true-north/plugin-sdk';
import { FIRST_PARTY_PLUGIN_IDS, firstPartyPlugins, type FirstPartyPluginId } from '../../plugin/desktop-plugins';

export const firstPartyRendererLoaders = {
  growth: () => import('@true-north/plugin-growth/renderer'),
  expense: () => import('@true-north/plugin-expense/renderer'),
  purchase: () => import('@true-north/plugin-purchase/renderer'),
  library: () => import('@true-north/plugin-library/renderer'),
} as const satisfies Record<FirstPartyPluginId, NonNullable<PluginDescriptor['loadRenderer']>>;

export function firstPartyRendererDescriptors(): PluginDescriptor[] {
  return FIRST_PARTY_PLUGIN_IDS.map((pluginId) => ({
    manifest: firstPartyPlugins[pluginId].manifest,
    loadRenderer: firstPartyRendererLoaders[pluginId],
  }));
}
