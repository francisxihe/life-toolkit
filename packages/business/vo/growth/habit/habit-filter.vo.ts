import { HabitStatus, Difficulty } from '@life-toolkit/enum';
import { HabitVo } from './habit-model.vo';
import { BaseFilterVo } from '../../common';

export type HabitFilterVo = {
  startDateStart?: string;
  startDateEnd?: string;
  endDateStart?: string;
  endDateEnd?: string;
  excludeIds?: string[];
  id?: string;
  goalId?: string;
} & BaseFilterVo &
  Partial<Pick<HabitVo, 'status' | 'difficulty' | 'tags' | 'importance'>>;

export type HabitPageFilterVo = HabitFilterVo & {
  pageNum: number;
  pageSize: number;
};
