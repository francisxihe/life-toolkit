import { HabitVo, HabitModelVo, HabitCompletionScore } from './habit-model.vo';
import { HabitStatus, Difficulty, Importance } from '@life-toolkit/enum';
import { BaseFilterVo } from '../../common';

export type HabitFilterVo = BaseFilterVo &
  Partial<
    Pick<HabitVo, 'status' | 'difficulty' | 'importance' | 'tags'> & {
      statusList?: HabitStatus[];
      difficultyList?: Difficulty[];
      startDateStart?: string;
      startDateEnd?: string;
      endDataStart?: string;
      endDataEnd?: string;
      goalIds?: string[];
    }
  >;

export type HabitPageFilterVo = HabitFilterVo & {
  pageNum?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'importance' | 'currentStreak' | 'longestStreak' | 'completedCount';
  sortOrder?: 'ASC' | 'DESC';
};

export type HabitListVo = {
  list: HabitModelVo[];
};

export type HabitPageVo = {
  list: HabitModelVo[];
  total: number;
  pageNum: number;
  pageSize: number;
};

export type HabitLogListFiltersVo = Partial<{
  habitId?: string;
  habitIds?: string[];
  logDateFrom?: string;
  logDateTo?: string;
  completionScoreList?: HabitCompletionScore[];
  moodMin?: number;
  moodMax?: number;
  hasNote?: boolean;
  excludeIds?: string[];
}>;

export type HabitLogPageFiltersVo = HabitLogListFiltersVo & {
  pageNum?: number;
  pageSize?: number;
  sortBy?: 'logDate' | 'completionScore' | 'mood' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
};

export type HabitLogListVo = {
  list: HabitModelVo[];
};

export type HabitLogPageVo = {
  list: HabitModelVo[];
  total: number;
  pageNum: number;
  pageSize: number;
};
