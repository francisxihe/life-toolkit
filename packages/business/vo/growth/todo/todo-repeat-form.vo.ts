import { TodoRepeatVo } from './todo-repeat-model.vo';

export type CreateTodoRepeatVo = Pick<
  TodoRepeatVo,
  | 'name'
  | 'description'
  | 'importance'
  | 'urgency'
  | 'tags'
  | 'status'
  | 'currentDate'
  | 'repeatStartDate'
  | 'repeatMode'
  | 'repeatConfig'
  | 'repeatEndMode'
  | 'repeatEndDate'
  | 'repeatTimes'
  | 'repeatedTimes'
>;

export type UpdateTodoRepeatVo = Partial<CreateTodoRepeatVo>;
