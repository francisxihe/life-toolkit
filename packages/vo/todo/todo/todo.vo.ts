import { BaseModelVo } from "../../base/model.vo";

export type TodoModelVo = {
  name: string;

  status: "todo" | "done" | "abandoned";

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
