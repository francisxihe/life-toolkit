import type { ActivityPort, CreateActivityInput, TodaySectionContribution, CaptureAdopter } from '@true-north/plugin-sdk';
import type { ActivityEntityRef } from '@true-north/plugin-sdk';
import { activityService } from './activity.service';

const activityPort: ActivityPort = {
  record: async (input: CreateActivityInput) => {
    await activityService.create({
      title: input.title,
      summary: input.summary,
      source: input.source as never,
      occurredAt: input.occurredAt,
      captureMessageId: input.captureMessageId,
      links: input.links.map((link) => ({
        pluginId: link.pluginId,
        entityType: link.entityType,
        entityId: link.entityId,
        role: link.role,
        label: link.label,
      })),
    });
  },
  unlink: async (ref) => {
    await activityService.unlinkRef(ref);
  },
};

export function getActivityPort(): ActivityPort {
  return activityPort;
}

export async function unlinkRef(ref: ActivityEntityRef) {
  return activityPort.unlink(ref);
}

export function bindCaptureAdopters(adopters: CaptureAdopter[]) {
  activityService.configureCaptureAdopters(adopters);
}

export function bindTodayContributions(contributions: TodaySectionContribution[]) {
  activityService.configureToday(contributions);
}
