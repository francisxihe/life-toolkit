import { HabitWithoutRelationsVo } from './habit-model.vo';

export type CreateHabitVo = Pick<
  HabitWithoutRelationsVo,
  'name' | 'description' | 'importance' | 'tags' | 'difficulty' | 'startAt' | 'endAt'
> & {
  goalIds?: string[];
};

export type UpdateHabitVo = Partial<CreateHabitVo> & {
  status?: HabitWithoutRelationsVo['status'];
};
