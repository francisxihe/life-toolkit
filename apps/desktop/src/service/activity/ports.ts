import type { ActivityPort, CreateActivityInput, TodayContribution, CaptureAdopter } from '@true-north/plugin-sdk';
import {
  activityRefFromLegacyDomain,
  type ActivityEntityRef,
} from '@true-north/plugin-sdk';
import { activityService } from './activity.service';

let activityPort: ActivityPort = {
  record: async (input) => {
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

export function bindActivityPort(port: ActivityPort) {
  activityPort = port;
}

export function getActivityPort(): ActivityPort {
  return activityPort;
}

export async function recordDomainActivity(input: CreateActivityInput) {
  return activityPort.record(input);
}

export async function unlinkDomain(domain: string, entityId: string) {
  return activityPort.unlink(activityRefFromLegacyDomain(domain, entityId));
}

export async function unlinkRef(ref: ActivityEntityRef) {
  return activityPort.unlink(ref);
}

export function bindCaptureAdopters(adopters: CaptureAdopter[]) {
  activityService.configureCaptureAdopters(adopters);
}

export function bindTodayContributions(contributions: TodayContribution[]) {
  activityService.configureToday(contributions);
}
