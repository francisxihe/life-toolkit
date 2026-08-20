import { BaseEntityVo } from '../../common';
import { GoalVo } from '../goal/goal-model.vo';
import { HabitStatus, Difficulty, Importance } from '@true-north/enum';
import { TodoVo } from '../todo/todo-model.vo';
import type { RepeatConfigPayload } from '@true-north/components-repeat/types';
import { RepeatEndMode, RepeatMode } from '@true-north/components-repeat/types';

export type HabitWithoutRelationsVo = {
  name: string;
  status: HabitStatus;
  description?: string;
  importance?: Importance;
  tags: string[];
  difficulty: Difficulty;
  repeatMode: RepeatMode;
  repeatConfig?: RepeatConfigPayload;
  repeatEndMode: RepeatEndMode;
  repeatEndDate?: string;
  repeatTimes?: number;
  repeatStartDate: string;
  /** 关联的共享调度实体 */
  repeatId?: string;
  cycleTodoId?: string;
  cycleCount: number;
  currentStreak: number;
  longestStreak: number;
  completedCount: number;
  doneAt?: string;
  abandonedAt?: string;
} & BaseEntityVo;

export type HabitVo = HabitWithoutRelationsVo & {
  goals?: GoalVo[];
  todos?: TodoVo[];
};
