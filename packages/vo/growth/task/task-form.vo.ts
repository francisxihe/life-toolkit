export * from "./task-model.vo";
import { TaskModelVo, TaskVo } from "./task-model.vo";

export type CreateTaskVo = Omit<
  TaskModelVo,
  "doneAt" | "abandonedAt" | "status"
>;

export type UpdateTaskVo = Partial<CreateTaskVo>;
