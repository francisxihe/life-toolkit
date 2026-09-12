export const PLUGIN_API_VERSION = '2.0' as const;

export type PluginApiVersion = typeof PLUGIN_API_VERSION;

export const PLUGIN_HUB_PATH = '/plugins';

export function pluginPath(pluginId: string): string {
  return `${PLUGIN_HUB_PATH}/${pluginId}`;
}

export function namespacedId(pluginId: string, localId: string): string {
  if (!localId) return pluginId;
  if (localId.startsWith(`${pluginId}.`)) return localId;
  return `${pluginId}.${localId}`;
}

export type HostCapabilityId = 'activity' | 'ai' | 'storage' | 'workbench' | 'ipc';

export const SHELL_SLOT_IDS = [
  'app-providers',
  'aside-sessions',
  'aside-actions',
  'page-overlay',
  'sidebar-primary',
  'stage-aside',
] as const;

export type ShellSlotId = (typeof SHELL_SLOT_IDS)[number];
