import { BaseEntityVo } from '../../common';
import { TrackTimeVo } from '../track-time/track-time.vo';
import { GoalVo } from '../goal/goal-model.vo';
import { TodoVo } from '../todo/todo-model.vo';
import { TaskStatus } from '@life-toolkit/enum';

export type TaskWithoutRelationsVo = {
  name: string;
  status: TaskStatus;
  estimateTime?: string;
  trackTimeIds: string[];
  description?: string;
  importance?: number;
  urgency?: number;
  tags: string[];
  doneAt?: string;
  abandonedAt?: string;
  startAt?: string;
  endAt?: string;
  parentId?: string;
  goalId?: string;
} & BaseEntityVo;

export type TaskVo = TaskWithoutRelationsVo & {
  children?: TaskVo[];
  parent?: TaskVo;
  goal?: GoalVo;
  trackTimeList?: TrackTimeVo[];
  todoList?: TodoVo[];
};
