import { BaseEntityVo } from '../../common';
import { TodoVo } from '../todo/todo-model.vo';
import { RepeatMode, RepeatEndMode, type RepeatConfigPayload } from '@true-north/components-repeat/types';
import { TodoRepeatStatus } from '@true-north/enum';

export type TodoRepeatWithoutRelationsVo = {
  /** 以下规则字段由关联 Repeat 展平 */
  repeatMode: RepeatMode;
  repeatConfig?: RepeatConfigPayload;
  repeatEndMode: RepeatEndMode;
  repeatEndDate?: string;
  repeatTimes?: number;
  repeatStartDate: string;
  currentDate: string;
  repeatId?: string;
  name: string;
  description?: string;
  importance?: number;
  urgency?: number;
  status: TodoRepeatStatus;
  abandonedAt?: string;
} & BaseEntityVo;

export type TodoRepeatVo = TodoRepeatWithoutRelationsVo & {
  todos?: TodoVo[];
};
