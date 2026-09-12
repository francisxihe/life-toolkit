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
  sections: Array<{
    id: string;
    kind: 'metric' | 'list' | 'timer';
    titleKey: string;
    order?: number;
    value?: number;
    unit?: string;
    items?: Array<{
      id: string;
      label: string;
      href?: string;
      overdue?: boolean;
      pluginId?: string;
      entityType?: string;
      actions?: Array<{
        id: string;
        labelKey: string;
        disabled?: boolean;
        command?: {
          method: 'GET' | 'POST' | 'PUT' | 'DELETE';
          path: string;
          payload?: Record<string, unknown>;
        };
        hostAction?: string;
      }>;
      meta?: Record<string, unknown>;
    }>;
    timer?: {
      id: string;
      label?: string;
      startedAt: string;
      hostAction?: string;
    };
  }>;
};
