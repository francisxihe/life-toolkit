import { BaseModelVo } from "../../base/model.vo";
import { TaskVo } from "../task/task-model.vo";
import { RepeatVo } from "@life-toolkit/components-repeat/vo";
import { TodoStatus } from "@life-toolkit/enum";

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

  repeat?: RepeatVo;

  doneAt?: string;

  abandonedAt?: string;
};

export type TodoItemVo = BaseModelVo & TodoModelVo;

export type TodoVo = TodoItemVo & {
  /** 关联的任务 */
  task?: TaskVo;
};
