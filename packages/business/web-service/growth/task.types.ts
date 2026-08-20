import { Difficulty } from '@true-north/enum';
import { GoalVo, TaskVo, TrackTimeWithoutRelationsVo, TodoVo } from '@true-north/vo';
import { Dayjs } from 'dayjs';

export type TaskFormData = {
  id?: string;
  name: string;
  description?: string;
  status?: TaskVo['status'];
  tags?: string[];
  importance?: number;
  difficulty?: Difficulty;
  urgency?: number;
  planTimeRange: [Dayjs | TaskVo['startAt'], Dayjs | TaskVo['endAt']];
  estimateTime?: number;
  isSubTask: boolean;
  // 以下为关联数据
  goalId?: string;
  parentId?: string;
  children: TaskVo[];
  todoList?: TodoVo[];
  trackTimeList?: TrackTimeWithoutRelationsVo[];
};
