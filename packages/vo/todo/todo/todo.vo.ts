import { BaseModelVo } from "../../base/model.vo";

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

export type TodoVo = BaseModelVo & TodoModelVo;
