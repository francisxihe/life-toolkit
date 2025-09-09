import { HabitWithoutRelationsVo } from './habit-model.vo';

export type CreateHabitVo = Pick<
  HabitVo,
  'name' | 'description' | 'importance' | 'tags' | 'difficulty' | 'startDate' | 'targetDate'
> & {
  goalIds?: string[];
};

export type UpdateHabitVo = Partial<CreateHabitVo>;
