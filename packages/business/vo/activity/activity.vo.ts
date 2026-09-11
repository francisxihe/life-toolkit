import type { ActivityDomain, ActivityLinkRole, ActivitySource } from '@true-north/enum';
import type { BaseEntityVo } from '../common';

export type ActivityLinkVo = BaseEntityVo & {
  activityId: string;
  pluginId?: string;
  entityType?: string;
  domain: ActivityDomain | `${ActivityDomain}`;
  entityId: string;
  role?: ActivityLinkRole | `${ActivityLinkRole}` | string;
  label?: string;
};

export type ActivityVo = BaseEntityVo & {
  occurredAt: string;
  title: string;
  summary?: string;
  source: ActivitySource | `${ActivitySource}`;
  captureMessageId?: string;
  links: ActivityLinkVo[];
};

export type CreateActivityVo = {
  occurredAt?: string;
  title: string;
  summary?: string;
  source: ActivitySource | `${ActivitySource}`;
  captureMessageId?: string;
  links: Array<{
    pluginId?: string;
    entityType?: string;
    domain?: ActivityDomain | `${ActivityDomain}`;
    entityId: string;
    role?: string;
    label?: string;
  }>;
};

export type ActivityFilterVo = {
  from?: string;
  to?: string;
  domain?: ActivityDomain | `${ActivityDomain}`;
  pluginId?: string;
  keyword?: string;
};

export type HomeTodayVo = {
  spent: number;
  pendingPurchases: number;
  focusSeconds: number;
  bookmarkCount: number;
  todos: Array<{ id: string; name: string; planDate: string; overdue: boolean }>;
  habits: Array<{ id: string; name: string; cycleTodoId?: string }>;
  purchases: Array<{ id: string; name: string; neededAt?: string }>;
  runningFocus?: { id: string; label?: string; startedAt: string };
};
