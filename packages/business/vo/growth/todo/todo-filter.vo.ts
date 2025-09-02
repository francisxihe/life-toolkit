import { TodoVo, TodoItemVo } from "./todo-model.vo";

export type TodoPageVo = {
  list: TodoItemVo[];

  total: number;

  pageNum: number;

  pageSize: number;
};

export type TodoListVo = {
  list: TodoItemVo[];
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
