import { TodoVo } from './todo-model.vo';
import { CreateTodoRepeatVo } from './todo-repeat-form.vo';

export type CreateTodoVo = Pick<
  TodoVo,
  | 'name'
  | 'description'
  | 'status'
  | 'planDate'
  | 'planStartTime'
  | 'planEndTime'
  | 'importance'
  | 'urgency'
  | 'repeatConfig'
  | 'taskId'
  | 'repeatId'
  | 'habitId'
> & {
  relatedType?: TodoVo['relatedType'];
  relatedId?: string;
};

export type UpdateTodoVo = Partial<CreateTodoVo>;
