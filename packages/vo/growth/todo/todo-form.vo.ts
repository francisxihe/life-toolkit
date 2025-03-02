import { TodoModelVo } from "./todo-model.vo";

export type CreateTodoVo = Omit<
  TodoModelVo,
  "doneAt" | "abandonedAt" | "status"
>;

export type UpdateTodoVo = Partial<CreateTodoVo>;
