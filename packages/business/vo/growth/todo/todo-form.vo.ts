import { TodoVo } from './todo-model.vo';
import { CreateTodoRepeatVo } from './todo-repeat-form.vo';

export type CreateTodoVo = Pick<TodoVo, 'name' | 'description' | 'status' | 'planDate' | 'planStartAt' | 'planEndAt' | 'importance' | 'urgency' | 'tags' | 'taskId'> & {
  repeat?: { currentDate: CreateTodoRepeatVo['currentDate']; repeatStartDate: CreateTodoRepeatVo['repeatStartDate']; repeatMode: CreateTodoRepeatVo['repeatMode']; repeatConfig: CreateTodoRepeatVo['repeatConfig']; repeatEndMode: CreateTodoRepeatVo['repeatEndMode']; repeatEndDate: CreateTodoRepeatVo['repeatEndDate']; repeatTimes: CreateTodoRepeatVo['repeatTimes']; repeatedTimes: CreateTodoRepeatVo['repeatedTimes'] };
};

export type UpdateTodoVo = Partial<CreateTodoVo>;