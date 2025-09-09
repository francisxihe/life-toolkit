import { BaseEntityVo } from '../../common';
import { TaskVo } from '../task/task-model.vo';
import { TodoRepeatVo } from './todo-repeat-model.vo';
import { TodoSource, TodoStatus } from '@life-toolkit/enum';
import { HabitVo } from '../habit/habit-model.vo';

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
  repeatConfig?: {
    currentDate: TodoRepeatVo['currentDate'];
    repeatStartDate: TodoRepeatVo['repeatStartDate'];
    repeatMode: TodoRepeatVo['repeatMode'];
    repeatConfig: TodoRepeatVo['repeatConfig'];
    repeatEndMode: TodoRepeatVo['repeatEndMode'];
    repeatEndDate: TodoRepeatVo['repeatEndDate'];
    repeatTimes: TodoRepeatVo['repeatTimes'];
    repeatedTimes: TodoRepeatVo['repeatedTimes'];
  };
  task?: TaskVo;
  habit?: HabitVo;
  repeat?: TodoRepeatVo;
};
