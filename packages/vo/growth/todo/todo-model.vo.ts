import { BaseModelVo } from "../../base/model.vo";
import { TaskVo } from "../task/task-model.vo";

export enum TodoStatus {
  TODO = "todo",
  DONE = "done",
  ABANDONED = "abandoned",
}

export type TodoModelVo = {
  name: string;

  status: TodoStatus;

  planDate: string;

  description?: string;

  tags?: string[];

  importance?: number;

  urgency?: number;

  planStartAt?: string;

  planEndAt?: string;

  repeat?: "none" | "daily" | "weekly" | "monthly";

  doneAt?: string;

  abandonedAt?: string;
};

export type TodoItemVo = BaseModelVo & TodoModelVo;

export type TodoVo = TodoItemVo & {
  /** 关联的任务 */
  task?: TaskVo;
};
