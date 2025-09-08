export * from './task-model.vo';
import { TaskWithoutRelationsVo, TaskVo } from './task-model.vo';

export type CreateTaskVo = Pick<
  TaskWithoutRelationsVo,
  'name' | 'description' | 'tags' | 'estimateTime' | 'importance' | 'urgency' | 'goalId' | 'startAt' | 'endAt'
> & {
  parentId?: string;
};

export type UpdateTaskVo = Partial<CreateTaskVo>;
