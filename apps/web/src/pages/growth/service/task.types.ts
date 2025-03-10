import {
  GoalVo,
  TaskVo,
  TrackTimeModelVo,
  TodoVo,
} from '@life-toolkit/vo/growth';

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
  isSubTask: boolean;
  // 以下为关联数据
  goalId?: string;
  parentId?: string;
  children: TaskVo[];
  todoList?: TodoVo[];
  trackTimeList?: TrackTimeModelVo[];
};
