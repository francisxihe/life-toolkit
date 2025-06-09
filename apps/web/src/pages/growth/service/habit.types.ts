import { HabitStatus, HabitDifficulty } from '@life-toolkit/vo/growth/habit';

export interface HabitFilter {
  keyword?: string;
  status?: HabitStatus[];
  difficulty?: HabitDifficulty[];
  tags?: string[];
}

export interface HabitPageFilter extends HabitFilter {
  pageNum?: number;
  pageSize?: number;
} 