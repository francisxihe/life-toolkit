import { GoalVo, TaskVo, TrackTimeModelVo, TodoVo } from '@life-toolkit/vo/growth';

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
  goalId?: string;
  trackTimeList?: TrackTimeModelVo[];
  children: TaskVo[];
  parentId?: string;
  todoList: TodoVo[];
};
