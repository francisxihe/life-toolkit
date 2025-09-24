import { HabitVo } from './habit-model.vo';

export type CreateHabitVo = Pick<
  HabitVo,
  | 'name'
  | 'description'
  | 'importance'
  | 'tags'
  | 'difficulty'
  | 'repeatStartDate'
  | 'repeatEndDate'
  | 'repeatTimes'
  | 'repeatMode'
  | 'repeatConfig'
  | 'repeatEndMode'
> & {
  goalIds?: string[];
};

export type UpdateHabitVo = Partial<CreateHabitVo>;
