import { BaseFilterVo } from '../../common';
import { TodoRepeatVo } from './todo-repeat-model.vo';

export type TodoRepeatFilterVo = {
  currentDateStart?: string;
  currentDateEnd?: string;
  abandonedDateStart?: string;
  abandonedDateEnd?: string;
} & BaseFilterVo & Partial<Pick<TodoRepeatVo, 'importance' | 'urgency' | 'status'>>;

export type TodoRepeatPageFilterVo = TodoRepeatFilterVo & {
  pageNum: number;
  pageSize: number;
};