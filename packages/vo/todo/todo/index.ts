export * from "./todo.vo";
import { TodoModelVo, TodoVo } from "./todo.vo";

export type TodoPageVo = {
  list: TodoVo[];

  total: number;

  pageNum: number;

  pageSize: number;
};

export type CreateTodoVo = Omit<
  TodoModelVo,
  "doneAt" | "abandonedAt" | "status"
>;

export type UpdateTodoVo = Partial<CreateTodoVo>;

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
