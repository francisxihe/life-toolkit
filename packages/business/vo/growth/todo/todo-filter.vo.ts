import { TodoVo, TodoWithoutRelationsVo } from './todo-model.vo';
import { BaseFilterVo } from '../../common';
import { TodoSource } from '@life-toolkit/enum';

export type TodoPageVo = {
  list: TodoWithoutRelationsVo[];

  total: number;

  pageNum: number;

  pageSize: number;
};

export type TodoListVo = {
  list: TodoWithoutRelationsVo[];
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
