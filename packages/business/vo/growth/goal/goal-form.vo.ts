import { GoalWithoutRelationsVo } from './goal-model.vo';

export type CreateGoalVo = Pick<
  GoalWithoutRelationsVo,
  'name' | 'type' | 'startAt' | 'endAt' | 'description' | 'importance' | 'difficulty' | 'status'
> & {
  parentId?: string;
};

export type UpdateGoalVo = Partial<CreateGoalVo>;
