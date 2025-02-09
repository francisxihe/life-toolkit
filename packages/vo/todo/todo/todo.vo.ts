import { BaseModelVo } from "../../base/model.vo";

export type TodoModelVO = {
  name: string;

  description?: string;

  status?: "todo" | "done" | "abandoned";

  tags?: string[];

  importance?: number;

  urgency?: number;

  planDate: string;

  planStartAt?: string;

  planEndAt?: string;

  repeat?: "none" | "daily" | "weekly" | "monthly";

  doneAt?: Date;

  abandonedAt?: Date;
};

export type TodoVO = BaseModelVo & TodoModelVO;
