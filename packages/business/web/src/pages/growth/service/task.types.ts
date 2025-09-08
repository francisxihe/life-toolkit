import {
  GoalVo,
  TaskVo,
  TrackTimeWithoutRelationsVo,
  TodoVo,
} from '@life-toolkit/vo';

export type TaskFormData = {
  id?: string;
  name: string;
  description?: string;
  status?: TaskVo['status'];
  tags?: string[];
  importance?: number;
  urgency?: number;
  planTimeRange: [TaskVo['startAt'], TaskVo['endAt']];
  estimateTime?: string;
  isSubTask: boolean;
  // 以下为关联数据
  goalId?: string;
  parentId?: string;
  children: TaskVo[];
  todoList?: TodoVo[];
  trackTimeList?: TrackTimeWithoutRelationsVo[];
};
