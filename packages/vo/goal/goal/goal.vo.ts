import { BaseModelVo } from "../../base/model.vo";
import { TrackTimeVo } from "../../track-time/track-time.vo";

export enum GoalStatus {
  TODO = "1",
  IN_PROGRESS = "2",
  DONE = "3",
  ABANDONED = "4",
}

export enum GoalType {
  OBJECTIVE = "1",
  KEY_RESULT = "2",
}

export type GoalModelVo = {
  name: string;

  status: GoalStatus;

  description?: string;

  importance?: number;

  urgency?: number;

  startAt?: string;

  endAt?: string;

  doneAt?: string;

  abandonedAt?: string;
};

export type GoalItemVo = BaseModelVo & GoalModelVo;

export type GoalVo = GoalItemVo & {
  children: GoalVo[];
  parent?: GoalVo;
};
