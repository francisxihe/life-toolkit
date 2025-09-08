import { TodoVo, TodoModelVo } from './todo-model.vo';
import { BaseFilterVo } from '../../common';
import { TodoSource } from '@life-toolkit/enum';

export type TodoPageVo = {
  list: TodoModelVo[];

  total: number;

  pageNum: number;

  pageSize: number;
};

export type TodoListVo = {
  list: TodoModelVo[];
};

export type TodoFilterVo = BaseFilterVo & {
  planDateStart?: string;
  planDateEnd?: string;
  importance?: TodoVo['importance'];
  urgency?: TodoVo['urgency'];
  status?: TodoVo['status'];
  doneDateStart?: string;
  doneDateEnd?: string;
  abandonedDateStart?: string;
  abandonedDateEnd?: string;
  todoWithRepeatList?: {
    id: string;
    source: TodoSource;
  }[];
};

export type TodoPageFilterVo = TodoFilterVo & {
  pageNum: number;
  pageSize: number;
};
