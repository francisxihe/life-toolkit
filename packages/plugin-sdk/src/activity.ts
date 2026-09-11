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

const LEGACY_DOMAIN_TO_REF: Record<string, { pluginId: string; entityType: string }> = {
  todo: { pluginId: 'growth', entityType: 'todo' },
  habit: { pluginId: 'growth', entityType: 'habit' },
  task: { pluginId: 'growth', entityType: 'task' },
  goal: { pluginId: 'growth', entityType: 'goal' },
  focus: { pluginId: 'growth', entityType: 'track-time' },
  expense: { pluginId: 'expense', entityType: 'transaction' },
  purchase: { pluginId: 'purchase', entityType: 'purchase' },
  bookmark: { pluginId: 'library', entityType: 'bookmark' },
};

export function activityRefFromLegacyDomain(domain: string, entityId: string): ActivityEntityRef {
  const mapped = LEGACY_DOMAIN_TO_REF[domain];
  if (mapped) return { ...mapped, entityId };
  return { pluginId: domain, entityType: domain, entityId };
}

export function legacyDomainFromActivityRef(ref: ActivityEntityRef): string {
  const entry = Object.entries(LEGACY_DOMAIN_TO_REF).find(
    ([, value]) => value.pluginId === ref.pluginId && value.entityType === ref.entityType,
  );
  return entry?.[0] || ref.entityType;
}

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

export type ActivityRecordEvent = {
  type: typeof ACTIVITY_RECORD_EVENT;
  payload: CreateActivityInput;
};

export type ActivityUnlinkEvent = {
  type: typeof ACTIVITY_UNLINK_EVENT;
  payload: ActivityEntityRef;
};

export type EntityPresenter = {
  pluginId: string;
  entityType: string;
  kindLabel: string;
  openPath(entityId: string): string;
};

export type TodayContribution = {
  pluginId: string;
  collect(): Promise<Partial<TodaySnapshot>>;
};

export type TodaySnapshot = {
  spent: number;
  pendingPurchases: number;
  focusSeconds: number;
  bookmarkCount: number;
  todos: Array<{ id: string; name: string; planDate: string; overdue: boolean }>;
  habits: Array<{ id: string; name: string; cycleTodoId?: string }>;
  purchases: Array<{ id: string; name: string; neededAt?: string }>;
  runningFocus?: { id: string; label?: string; startedAt: string };
};

export function mergeTodaySnapshots(parts: Array<Partial<TodaySnapshot>>): TodaySnapshot {
  const base: TodaySnapshot = {
    spent: 0,
    pendingPurchases: 0,
    focusSeconds: 0,
    bookmarkCount: 0,
    todos: [],
    habits: [],
    purchases: [],
  };
  for (const part of parts) {
    base.spent += part.spent || 0;
    base.pendingPurchases += part.pendingPurchases || 0;
    base.focusSeconds += part.focusSeconds || 0;
    base.bookmarkCount += part.bookmarkCount || 0;
    if (part.todos) base.todos.push(...part.todos);
    if (part.habits) base.habits.push(...part.habits);
    if (part.purchases) base.purchases.push(...part.purchases);
    if (part.runningFocus) base.runningFocus = part.runningFocus;
  }
  return base;
}
