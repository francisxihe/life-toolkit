import { BaseModelVo } from "../../base/model.vo";

export type TodoModelVO = {
  name: string;

  description: string | null;

  status?: "todo" | "done" | "abandoned";

  tags: string[] | null;

  importance: number | null;

  urgency: number | null;

  planDate: string;

  planTimeRange: [string, string] | null;

  repeat?: "none" | "daily" | "weekly" | "monthly";

  doneAt: Date | null;

  abandonedAt: Date | null;
};

export type TodoVO = BaseModelVo & TodoModelVO;
