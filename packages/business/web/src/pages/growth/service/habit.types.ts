import { HabitStatus, Difficulty } from '@life-toolkit/enum';

export interface HabitFilter {
  keyword?: string;
  status?: HabitStatus[];
  difficulty?: Difficulty[];
  tags?: string[];
}

export interface HabitPageFilter extends HabitFilter {
  pageNum?: number;
  pageSize?: number;
} 