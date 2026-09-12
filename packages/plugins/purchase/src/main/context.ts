import type { ActivityPort } from '@true-north/plugin-sdk';

let activityPort: ActivityPort | null = null;

export function bindPurchaseContext(activity: ActivityPort) {
  activityPort = activity;
}

export async function recordPurchaseActivity(input: { title: string; entityId: string; label?: string }) {
  try {
    await activityPort?.record({
      title: input.title,
      source: 'domain',
      links: [{ pluginId: 'purchase', entityType: 'purchase', entityId: input.entityId, role: 'purchase', label: input.label }],
    });
  } catch {
    // supplementary
  }
}

export async function unlinkPurchaseEntity(entityId: string) {
  try {
    await activityPort?.unlink({ pluginId: 'purchase', entityType: 'purchase', entityId });
  } catch {
    // supplementary
  }
}
