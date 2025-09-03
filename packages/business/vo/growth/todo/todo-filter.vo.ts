import { TodoVo, TodoModelVo } from './todo-model.vo';
import { BaseFilterVo } from '../../common';

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
};

export type TodoPageFilterVo = TodoFilterVo & {
  pageNum: number;
  pageSize: number;
};
