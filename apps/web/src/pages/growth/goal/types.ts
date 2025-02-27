import { GoalVo } from '@life-toolkit/vo/goal';
import { TrackTimeModelVo } from '@life-toolkit/vo/track-time';

export type GoalFormData = {
  id?: string;
  name: string;
  description?: string;
  status?: GoalVo['status'];
  importance?: number;
  urgency?: number;
  planTimeRange: [string | undefined, string | undefined];
  children: GoalFormData[];
  parentId?: string;
};
