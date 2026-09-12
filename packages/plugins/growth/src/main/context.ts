import type { ActivityPort, PluginMainContext } from '@true-north/plugin-sdk';

const PLUGIN_ID = 'growth';

let activityPort: ActivityPort | null = null;
let aiContext: PluginMainContext['ai'] | null = null;

export function bindGrowthContext(ctx: PluginMainContext) {
  activityPort = ctx.activity;
  aiContext = ctx.ai;
}

export function growthAi(): PluginMainContext['ai'] {
  if (!aiContext) throw new Error('Growth AI context is not bound');
  return aiContext;
}

export async function recordGrowthActivity(input: {
  title: string;
  summary?: string;
  source?: string;
  entityType: string;
  entityId: string;
  role?: string;
  label?: string;
}) {
  try {
    await activityPort?.record({
      title: input.title,
      summary: input.summary,
      source: input.source || 'domain',
      links: [
        {
          pluginId: PLUGIN_ID,
          entityType: input.entityType,
          entityId: input.entityId,
          role: input.role,
          label: input.label,
        },
      ],
    });
  } catch {
    // activity card is supplementary
  }
}

export async function unlinkGrowthEntity(entityType: string, entityId: string) {
  try {
    await activityPort?.unlink({ pluginId: PLUGIN_ID, entityType, entityId });
  } catch {
    // activity card is supplementary
  }
}
