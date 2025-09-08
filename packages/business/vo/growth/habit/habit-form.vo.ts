import { HabitWithoutRelationsVo, HabitCompletionScore } from './habit-model.vo';

export type CreateHabitVo = Omit<
  HabitWithoutRelationsVo,
  'status' | 'currentStreak' | 'longestStreak' | 'completedCount' | 'doneAt' | 'abandonedAt'
> & {
  goalIds?: string[];
};

export type UpdateHabitVo = Partial<CreateHabitVo> & {
  status?: HabitWithoutRelationsVo['status'];
};
