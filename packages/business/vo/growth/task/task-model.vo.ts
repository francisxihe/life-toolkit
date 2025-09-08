import { BaseEntityVo } from '../../common';
import { TrackTimeVo } from '../track-time/track-time.vo';
import { GoalVo } from '../goal/goal-model.vo';
import { TodoVo } from '../todo/todo-model.vo';
import { TaskStatus } from '@life-toolkit/enum';

export type TaskWithoutRelationsVo = {
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
} & BaseEntityVo;

export type TaskVo = TaskWithoutRelationsVo & {
  children: TaskVo[];
  parent?: TaskVo;
  trackTimeList?: TrackTimeVo[];
  goal?: GoalVo;
  todoList?: TodoVo[];
};
