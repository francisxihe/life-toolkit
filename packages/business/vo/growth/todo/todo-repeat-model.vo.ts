import { BaseEntityVo } from '../../common';
import { TodoVo } from '../todo/todo-model.vo';
import { RepeatMode, RepeatConfig, RepeatEndMode } from 'francis-types-repeat';
import { TodoStatus } from '@life-toolkit/enum';

export type TodoRepeatWithoutRelationsVo = {
  repeatMode: RepeatMode;
  repeatConfig?: RepeatConfig;
  repeatEndMode: RepeatEndMode;
  repeatEndDate?: string;
  repeatTimes?: number;
  repeatStartDate: string;
  currentDate: string;
  name: string;
  description?: string;
  importance?: number;
  urgency?: number;
  tags?: string[];
  status: TodoStatus;
  abandonedAt?: string;
} & BaseEntityVo;

export type TodoRepeatVo = TodoRepeatWithoutRelationsVo & {
  todos?: TodoVo[];
};
