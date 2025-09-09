import { BaseEntityVo } from '../../common';
import { TaskVo } from '../task/task-model.vo';
import { TodoRepeatVo } from './todo-repeat-model.vo';
import { TodoStatus, TodoSource } from '@life-toolkit/enum';

export type TodoWithoutRelationsVo = {
  name: string;
  status: TodoStatus;
  description?: string;
  importance?: number;
  urgency?: number;
  tags: string[];
  doneAt?: string;
  abandonedAt?: string;
  planStartAt?: string;
  planEndAt?: string;
  planDate: string;
  source?: TodoSource;
  taskId?: string;
  repeatId?: string;
  habitId?: string;
} & BaseEntityVo;

export type TodoVo = TodoWithoutRelationsVo & {
  task?: TaskVo;
  habit?: any;
  repeat?: TodoRepeatVo;
};