export * from "./sub-todo.vo";
import { SubTodoVO, SubTodoModelVO } from "./sub-todo.vo";

export type CreateSubTodoVO = Omit<SubTodoModelVO, "doneAt" | "abandonedAt">;

export type SubTodoWithSubVO = SubTodoVO & {
  subTodoList: SubTodoVO[];
};
