export * from "./sub-todo.vo";
import { SubTodoVo, SubTodoModelVo } from "./sub-todo.vo";

export type CreateSubTodoVo = Omit<
  SubTodoModelVo,
  "doneAt" | "abandonedAt" | "status"
>;

export type SubTodoWithSubVo = SubTodoVo & {
  subTodoList: SubTodoVo[];
};

export type SubTodoListFilterVo = {
  parentId: string;
};
