import type { ActivityPort } from '@true-north/plugin-sdk';

let activityPort: ActivityPort | null = null;

export function bindExpenseContext(activity: ActivityPort) {
  activityPort = activity;
}

export async function recordExpenseActivity(input: {
  title: string;
  entityId: string;
  label?: string;
}) {
  try {
    await activityPort?.record({
      title: input.title,
      source: 'domain',
      links: [{ pluginId: 'expense', entityType: 'transaction', entityId: input.entityId, role: 'expense', label: input.label }],
    });
  } catch {
    // supplementary
  }
}

export async function unlinkExpenseEntity(entityId: string) {
  try {
    await activityPort?.unlink({ pluginId: 'expense', entityType: 'transaction', entityId });
  } catch {
    // supplementary
  }
}
