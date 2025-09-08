export * from "./task-model.vo";
import { TaskWithoutRelationsVo, TaskVo } from "./task-model.vo";

export type CreateTaskVo = Omit<
  TaskWithoutRelationsVo,
  "doneAt" | "abandonedAt" | "status"
> & {
  parentId?: string;
};

export type UpdateTaskVo = Partial<CreateTaskVo>;
