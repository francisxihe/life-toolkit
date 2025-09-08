import { HabitStatus, Difficulty } from '@life-toolkit/enum';
import { HabitVo } from './habit-model.vo';
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
