import { HabitFilter, HabitPageFilter } from './habit.types';

export const mapHabitFilterToParams = (filter: HabitFilter) => {
  const params: Record<string, any> = {};

  if (filter.keyword) {
    params.keyword = filter.keyword;
  }

  if (filter.status && filter.status.length > 0) {
    params.status = filter.status;
  }

  if (filter.difficulty && filter.difficulty.length > 0) {
    params.difficulty = filter.difficulty;
  }

  if (filter.importance !== undefined) {
    params.importance = filter.importance;
  }

  if (filter.tags && filter.tags.length > 0) {
    params.tags = filter.tags;
  }

  return params;
};

export const mapHabitPageFilterToParams = (filter: HabitPageFilter) => {
  const params = mapHabitFilterToParams(filter);

  if (filter.pageNum) {
    params.pageNum = filter.pageNum;
  }

  if (filter.pageSize) {
    params.pageSize = filter.pageSize;
  }

  return params;
};
