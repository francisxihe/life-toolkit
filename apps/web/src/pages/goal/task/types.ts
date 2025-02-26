import { TaskVo } from '@life-toolkit/vo/task';
import { TrackTimeModelVo } from '@life-toolkit/vo/track-time';

export type TaskFormData = {
  id?: string;
  name: string;
  description?: string;
  status?: TaskVo['status'];
  tags?: string[];
  importance?: number;
  urgency?: number;
  planTimeRange: [string | undefined, string | undefined];
  estimateTime?: string;
  trackTimeList?: TrackTimeModelVo[];
  children: TaskFormData[];
  parentId?: string;
};
