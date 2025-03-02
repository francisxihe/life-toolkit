import { TaskVo, TrackTimeModelVo } from '@life-toolkit/vo/growth';

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
