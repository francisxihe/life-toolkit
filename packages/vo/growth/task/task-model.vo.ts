import { BaseModelVo } from "../../base/model.vo";
import { TrackTimeVo } from "../track-time/track-time.vo";
import { GoalVo } from "../goal/goal-model.vo";

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  DONE = "done",
  ABANDONED = "abandoned",
}

export type TaskModelVo = {
  name: string;

  status: TaskStatus;

  description?: string;

  tags?: string[];

  importance?: number;

  urgency?: number;

  startAt?: string;

  endAt?: string;

  doneAt?: string;

  abandonedAt?: string;

  estimateTime?: string;

  children: TaskModelVo[];
};

export type TaskVo = BaseModelVo &
  TaskModelVo & {
    children: TaskVo[];
    parent?: TaskVo;
    trackTimeList?: TrackTimeVo[];
    goal?: GoalVo;
  };
