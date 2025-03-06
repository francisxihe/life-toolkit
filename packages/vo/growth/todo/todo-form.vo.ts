import { TodoModelVo } from "./todo-model.vo";

export type CreateTodoVo = Omit<
  TodoModelVo,
  "doneAt" | "abandonedAt" | "status"
> & {
  taskId?: string;
};

export type UpdateTodoVo = Partial<CreateTodoVo>;
