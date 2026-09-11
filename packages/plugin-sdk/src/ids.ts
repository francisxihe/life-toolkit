export const PLUGIN_API_VERSION = '1.0' as const;

export type PluginApiVersion = typeof PLUGIN_API_VERSION;

export const REQUIRED_PLUGIN_IDS = [] as const;

export type RequiredPluginId = (typeof REQUIRED_PLUGIN_IDS)[number];

export const FIRST_PARTY_PLUGIN_IDS = [
  'growth',
  'expense',
  'purchase',
  'library',
] as const;

export type FirstPartyPluginId = (typeof FIRST_PARTY_PLUGIN_IDS)[number];

export function isRequiredPluginId(pluginId: string): pluginId is RequiredPluginId {
  return (REQUIRED_PLUGIN_IDS as readonly string[]).includes(pluginId);
}

export function namespacedId(pluginId: string, localId: string): string {
  if (!localId) return pluginId;
  if (localId.startsWith(`${pluginId}.`)) return localId;
  return `${pluginId}.${localId}`;
}

export const PLUGIN_HUB_PATH = '/plugins';

export function pluginPath(pluginId: string): string {
  return `${PLUGIN_HUB_PATH}/${pluginId}`;
}
