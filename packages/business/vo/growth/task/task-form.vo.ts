import { TaskVo } from './task-model.vo';

export type CreateTaskVo = Pick<TaskVo,
  | 'name'
  | 'description'
  | 'tags'
  | 'estimateTime'
  | 'importance'
  | 'difficulty'
  | 'urgency'
  | 'goalId'
  | 'startAt'
  | 'endAt'
  | 'parentId'
> & {
  trackTimeIds?: string[];
};

export type UpdateTaskVo = Partial<CreateTaskVo> & {
  status?: TaskVo['status'];
  doneAt?: TaskVo['doneAt'];
  abandonedAt?: TaskVo['abandonedAt'];
};