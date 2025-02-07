export * from "./todo.vo";
import { SubTodoVO } from "../sub-todo";
import { TodoModelVO, TodoVO } from "./todo.vo";

export type TodoWithSubVO = TodoVO & {
  subTodoList: SubTodoVO[];
};

export type TodoPageVO = {
  list: TodoVO[];

  total: number;

  pageNum: number;

  pageSize: number;
};

export type CreateTodoVO = Omit<TodoModelVO, "doneAt" | "abandonedAt">;

export type TodoListVO = {
  list: TodoVO[];
};

export type TodoListFiltersVO = {
  keyword?: string;
  planDateStart?: string;
  planDateEnd?: string;
  importance?: TodoVO["importance"];
  urgency?: TodoVO["urgency"];
  status?: TodoVO["status"];
  doneDateStart?: string;
  doneDateEnd?: string;
  abandonedDateStart?: string;
  abandonedDateEnd?: string;
};

export type TodoPageFiltersVO = {
  keyword?: string;
  planDateStart?: string;
  planDateEnd?: string;
  importance?: TodoVO["importance"];
  urgency?: TodoVO["urgency"];
  status?: TodoVO["status"];
  doneDateStart?: string;
  doneDateEnd?: string;
  abandonedDateStart?: string;
  abandonedDateEnd?: string;
};
