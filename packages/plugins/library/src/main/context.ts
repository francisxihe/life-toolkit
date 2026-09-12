import type { ActivityPort } from '@true-north/plugin-sdk';

let activityPort: ActivityPort | null = null;

export function bindLibraryContext(activity: ActivityPort) {
  activityPort = activity;
}

export async function recordLibraryActivity(input: { title: string; entityId: string; label?: string }) {
  try {
    await activityPort?.record({
      title: input.title,
      source: 'domain',
      links: [{ pluginId: 'library', entityType: 'bookmark', entityId: input.entityId, role: 'bookmark', label: input.label }],
    });
  } catch {
    // supplementary
  }
}

export async function unlinkLibraryEntity(entityId: string) {
  try {
    await activityPort?.unlink({ pluginId: 'library', entityType: 'bookmark', entityId });
  } catch {
    // supplementary
  }
}
