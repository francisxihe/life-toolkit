import { BaseModelVo } from '../../common/model.vo';
import { TodoStatus } from '@life-toolkit/enum';

export type TodoRepeatModelVo = {
  todos?: Todo[];
  repeatMode: RepeatMode;
  repeatConfig?: RepeatConfig;
  repeatEndMode: RepeatEndMode;
  repeatEndDate?: string;
  repeatTimes?: number;
  repeatedTimes?: number;
  name: string;
  description?: string;
  importance?: number;
  urgency?: number;
  tags?: string[];
  repeatStartDate: string;
  currentDate: string;
  status: TodoStatus;
  abandonedAt?: string;
  task?: Task;
  taskId?: string;
  repeat?: TodoRepeat;
  repeatId?: string;
  originalRepeatId?: string;
  habit?: any;
  habitId?: string;
} & BaseModelVo;

export type TodoRepeatListVo = {
  list: TodoRepeatModelVo[];
};

export type TodoRepeatPageVo = {
  list: TodoRepeatModelVo[];
  total: number;
  pageNum: number;
  pageSize: number;
};
