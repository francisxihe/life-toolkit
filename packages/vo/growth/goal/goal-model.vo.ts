import { BaseModelVo } from "../../base/model.vo";
import { TaskVo } from "../task/task-model.vo";

export enum GoalStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  DONE = "done",
  ABANDONED = "abandoned",
}

export enum GoalType {
  OBJECTIVE = "objective",
  KEY_RESULT = "key_result",
}

export type GoalModelVo = {
  name: string;

  status: GoalStatus;

  type?: GoalType;

  description?: string;

  importance?: number;

  urgency?: number;

  startAt?: string;

  endAt?: string;

  doneAt?: string;

  abandonedAt?: string;
};

export type GoalItemVo = BaseModelVo & GoalModelVo;

export type GoalVo = {
  children: GoalVo[];
  parent?: GoalVo;
  /** 任务 */
  taskList?: TaskVo[];
} & BaseModelVo &
  GoalModelVo;
