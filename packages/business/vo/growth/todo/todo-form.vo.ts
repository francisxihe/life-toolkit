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
  | 'source'
  | 'repeatConfig'
  | 'taskId'
  | 'repeatId'
  | 'habitId'
>;

export type UpdateTodoVo = Partial<CreateTodoVo>;
