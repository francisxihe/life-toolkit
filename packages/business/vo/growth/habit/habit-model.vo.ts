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
  startDate: string;
  targetDate?: string;
  currentStreak: number;
  longestStreak: number;
  completedCount: number;
} & BaseEntityVo;

export type HabitVo = HabitWithoutRelationsVo & {
  goals?: GoalVo[];
  todos?: TodoVo[];
};