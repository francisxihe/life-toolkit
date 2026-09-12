import { z } from 'zod';
import { PLUGIN_API_VERSION, SHELL_SLOT_IDS } from './ids.ts';
import { todaySectionDescriptorSchema } from './today.ts';

export const ipcContributionSchema = z.object({
  routePrefix: z.string().min(1),
});

export const keyedContributionSchema = z.object({
  key: z.string().min(1).optional(),
});

export const namedContributionSchema = z.object({
  name: z.string().min(1).optional(),
});

export const typedContributionSchema = z.object({
  type: z.string().min(1).optional(),
});

export const idContributionSchema = z.object({
  id: z.string().min(1).optional(),
});

export const shellSlotContributionSchema = z.object({
  slot: z.enum(SHELL_SLOT_IDS),
  order: z.number().optional(),
});

export const pluginContributionsSchema = z.object({
  ipc: z.record(z.string().min(1), ipcContributionSchema).optional(),
  ai: z
    .object({
      capabilities: z.record(z.string().min(1), keyedContributionSchema).optional(),
      tools: z.record(z.string().min(1), namedContributionSchema).optional(),
      entityTypes: z.array(z.string().min(1)).optional(),
    })
    .optional(),
  workbench: z
    .object({
      workspaces: z.record(z.string().min(1), keyedContributionSchema).optional(),
      actions: z.record(z.string().min(1), idContributionSchema).optional(),
    })
    .optional(),
  activity: z
    .object({
      captureTypes: z.record(z.string().min(1), typedContributionSchema).optional(),
      entityTypes: z.array(z.string().min(1)).optional(),
      today: z.record(z.string().min(1), todaySectionDescriptorSchema).optional(),
    })
    .optional(),
  storage: z
    .object({
      capability: z.literal('self-managed'),
      entityTypes: z.array(z.string().min(1)),
    })
    .optional(),
  shell: z
    .object({
      slots: z.record(z.string().min(1), shellSlotContributionSchema).optional(),
    })
    .optional(),
});

export const pluginCatalogMetaSchema = z.object({
  nameKey: z.string().min(1),
  descriptionKey: z.string().min(1).optional(),
  categoryKey: z.string().min(1).optional(),
  keywords: z.array(z.string()).optional(),
  order: z.number().optional(),
});

export const pluginManifestSchema = z.object({
  pluginId: z.string().min(1).regex(/^[a-z][a-z0-9-]*$/),
  apiVersion: z.literal(PLUGIN_API_VERSION),
  version: z.string().min(1),
  dependencies: z.array(z.string().min(1)).optional(),
  catalog: pluginCatalogMetaSchema,
  hostCapabilities: z.array(z.enum(['activity', 'ai', 'storage', 'workbench', 'ipc'])).optional(),
  contributions: pluginContributionsSchema.default({}),
});

export type PluginManifest = z.infer<typeof pluginManifestSchema>;

export function definePluginManifest<const M extends PluginManifest>(manifest: M): M {
  return pluginManifestSchema.parse(manifest) as M;
}

export function parsePluginManifest(input: unknown): PluginManifest {
  return pluginManifestSchema.parse(input);
}

export function contributionKey(
  pluginId: string,
  localId: string,
  explicit?: string,
): string {
  return explicit || `${pluginId}.${localId}`;
}
