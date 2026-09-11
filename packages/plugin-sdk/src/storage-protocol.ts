import { z } from 'zod';

/** Host storage capabilities. The protocol is storage-agnostic. */
export const hostStorageCapabilitySchema = z.enum([
  'host-shared-transactional',
  'host-isolated-sqlite',
  'self-managed',
]);

export type HostStorageCapability = z.infer<typeof hostStorageCapabilitySchema>;

export const storageContributionSchema = z.object({
  entityTypes: z.array(z.string().min(1)),
});

export type StorageContributionDescriptor = z.infer<typeof storageContributionSchema>;

export type PluginMigrationDescriptor = {
  id: string;
  version: number;
};

/** Exclusive directory the host creates for one plugin. */
export type PluginSpace = {
  pluginId: string;
  rootDir: string;
  /** Path to the former shared host SQLite, when a one-time table copy is still needed. */
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

/**
 * Optional SQL handle for plugins that choose SQLite.
 * Public host protocol does not use this; first-party plugins may use
 * `@true-north/plugin-sdk/host` for repository access.
 */
export type PluginQueryResult = unknown;

export type PluginStorageHandle = {
  pluginId: string;
  capability: HostStorageCapability;
  query(sql: string, params?: unknown[]): Promise<PluginQueryResult>;
  runInTransaction<T>(run: (tx: PluginStorageHandle) => Promise<T>): Promise<T>;
};
