import { TaskVo } from './task-model.vo';

export type CreateTaskVo = Pick<
  TaskVo,
  | 'name'
  | 'description'
  | 'tags'
  | 'estimateTime'
  | 'importance'
  | 'urgency'
  | 'goalId'
  | 'startAt'
  | 'endAt'
  | 'parentId'
> & {
  trackTimeIds?: string[];
};

export type UpdateTaskVo = Partial<CreateTaskVo>;
