import { BaseEntityVo } from '../../common';
import { GoalVo } from '../goal/goal-model.vo';
import { HabitStatus, Difficulty, Importance } from '@life-toolkit/enum';
import { TodoVo } from '../todo/todo-model.vo';

export type HabitWithoutRelationsVo = {
  name: string;
  status: HabitStatus;
  description?: string;
  importance?: Importance;
  tags: string[];
  difficulty: Difficulty;
  repeatMode: RepeatMode;
  repeatConfig?: RepeatConfig;
  repeatEndMode: RepeatEndMode;
  repeatEndDate?: string;
  repeatTimes?: number;
  repeatStartDate: string;
} & BaseEntityVo;

export type HabitVo = HabitWithoutRelationsVo & {
  goals?: GoalVo[];
  todos?: TodoVo[];
};
