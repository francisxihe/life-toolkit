import { TodoVo } from "./todo-model.vo";

export type TodoPageVo = {
  list: TodoVo[];

  total: number;

  pageNum: number;

  pageSize: number;
};

export type TodoListVo = {
  list: TodoVo[];
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
};

export type TodoPageFiltersVo = {
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
  tags?: string[];
};
