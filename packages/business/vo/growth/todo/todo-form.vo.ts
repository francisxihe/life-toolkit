import { TodoVo } from './todo-model.vo';
import { CreateTodoRepeatVo } from './todo-repeat-form.vo';

export type CreateTodoVo = Pick<
  TodoVo,
  | 'name'
  | 'description'
  | 'status'
  | 'planDate'
  | 'planStartAt'
  | 'planEndAt'
  | 'importance'
  | 'urgency'
  | 'tags'
  | 'taskId'
  | 'repeatConfig'
>;

export type UpdateTodoVo = Partial<CreateTodoVo>;
