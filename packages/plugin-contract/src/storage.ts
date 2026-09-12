import { z } from 'zod';

export const hostStorageCapabilitySchema = z.literal('self-managed');

export type HostStorageCapability = z.infer<typeof hostStorageCapabilitySchema>;

export type PluginSpace = {
  pluginId: string;
  rootDir: string;
  legacySharedDbPath?: string;
};

export type PluginRecord = {
  pluginId: string;
  entityType: string;
  id: string;
  label: string;
  payload?: Record<string, unknown>;
};

export type PluginQueryPort = {
  get(entityType: string, id: string): Promise<PluginRecord | null>;
  list(query: { entityType: string; q?: string; limit?: number }): Promise<PluginRecord[]>;
};
