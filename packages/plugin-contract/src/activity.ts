import { z } from 'zod';

export const activityEntityRefSchema = z.object({
  pluginId: z.string().min(1),
  entityType: z.string().min(1),
  entityId: z.string().min(1),
});

export type ActivityEntityRef = z.infer<typeof activityEntityRefSchema>;

export const activityLinkSchema = activityEntityRefSchema.extend({
  id: z.string().min(1).optional(),
  activityId: z.string().min(1).optional(),
  role: z.string().optional(),
  label: z.string().optional(),
});

export type ActivityLinkRef = z.infer<typeof activityLinkSchema>;

export type CreateActivityInput = {
  occurredAt?: string;
  title: string;
  summary?: string;
  source: string;
  captureMessageId?: string;
  links: Array<ActivityEntityRef & { role?: string; label?: string }>;
};

export type ActivityPort = {
  record(input: CreateActivityInput): Promise<void>;
  unlink(ref: ActivityEntityRef): Promise<void>;
};

export const ACTIVITY_RECORD_EVENT = 'activity.record';
export const ACTIVITY_UNLINK_EVENT = 'activity.unlink';
