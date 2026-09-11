import { z } from 'zod';
import { PLUGIN_API_VERSION } from './ids.ts';
import { storageContributionSchema } from './storage-protocol.ts';

export const ipcContributionDescriptorSchema = z.object({
  id: z.string().min(1),
  routePrefix: z.string().min(1),
});

export const aiContributionDescriptorSchema = z.object({
  capabilityKeys: z.array(z.string().min(1)).optional(),
  toolNames: z.array(z.string().min(1)).optional(),
  entityTypes: z.array(z.string().min(1)).optional(),
});

export const workbenchContributionDescriptorSchema = z.object({
  workspaceKeys: z.array(z.string().min(1)).optional(),
  actionIds: z.array(z.string().min(1)).optional(),
});

export const activityContributionDescriptorSchema = z.object({
  captureTypes: z.array(z.string().min(1)).optional(),
  entityTypes: z.array(z.string().min(1)).optional(),
  today: z.boolean().optional(),
});

export const pluginContributionsSchema = z.object({
  ipc: z.array(ipcContributionDescriptorSchema).optional(),
  ai: aiContributionDescriptorSchema.optional(),
  workbench: workbenchContributionDescriptorSchema.optional(),
  activity: activityContributionDescriptorSchema.optional(),
  storage: storageContributionSchema.optional(),
});

export const pluginManifestSchema = z.object({
  pluginId: z.string().min(1).regex(/^[a-z][a-z0-9-]*$/),
  apiVersion: z.literal(PLUGIN_API_VERSION),
  version: z.string().min(1),
  required: z.boolean().optional(),
  dependencies: z.array(z.string().min(1)).optional(),
  contributions: pluginContributionsSchema.default({}),
});

export type PluginManifest = z.infer<typeof pluginManifestSchema>;
export type IpcContributionDescriptor = z.infer<typeof ipcContributionDescriptorSchema>;

export function parsePluginManifest(input: unknown): PluginManifest {
  return pluginManifestSchema.parse(input);
}
