import { BaseModelVo } from "../../base/model.vo";
import { TaskVo } from "../task/task-model.vo";
import { GoalType, GoalStatus } from "@life-toolkit/enum";

export type GoalModelVo = {
  name: string;

  status: GoalStatus;

  type: GoalType;

  description?: string;

  importance: number;

  difficulty?: number;

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
