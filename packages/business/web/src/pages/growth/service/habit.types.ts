import { HabitStatus, Difficulty, Importance } from '@life-toolkit/enum';

export interface HabitFilter {
  keyword?: string;
  status?: HabitStatus[];
  difficulty?: Difficulty[];
  tags?: string[];
  importance?: Importance;
}

export interface HabitPageFilter extends HabitFilter {
  pageNum?: number;
  pageSize?: number;
}