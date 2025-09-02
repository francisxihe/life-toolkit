import { TodoVo, TodoModelVo } from "./todo-model.vo";

export type TodoPageVo = {
  list: TodoModelVo[];

  total: number;

  pageNum: number;

  pageSize: number;
};

export type TodoListVo = {
  list: TodoModelVo[];
};

export type TodoListFiltersVo = {
  keyword?: string;
  planDateStart?: string;
  planDateEnd?: string;
  importance?: TodoVo["importance"];
  urgency?: TodoVo["urgency"];
  status?: TodoVo["status"];
  doneDateStart?: string;
  doneDateEnd?: string;
  abandonedDateStart?: string;
  abandonedDateEnd?: string;
  includeIds?: string[];
};

export type TodoPageFiltersVo = TodoListFiltersVo & {
  pageNum: number;
  pageSize: number;
};
