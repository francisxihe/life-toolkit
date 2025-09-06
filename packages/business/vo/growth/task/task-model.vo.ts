import { BaseModelVo } from '../../common/model.vo';
import { TrackTimeVo } from '../track-time/track-time.vo';
import { GoalVo } from '../goal/goal-model.vo';
import { TodoVo } from '../todo/todo-model.vo';
import { TaskStatus } from '@life-toolkit/enum';

export type TaskModelVo = {
  name: string;
  status: TaskStatus;
  description?: string;
  importance?: number;
  urgency?: number;
  startAt?: string;
  endAt?: string;
  doneAt?: string;
  abandonedAt?: string;
  estimateTime?: string;
  goalId?: string;
  parentId?: string;
  tags?: string[];
} & BaseModelVo;

export type TaskVo = TaskModelVo & {
  children: TaskVo[];
  parent?: TaskVo;
  trackTimeList?: TrackTimeVo[];
  goal?: GoalVo;
  todoList?: TodoVo[];
};
