import { BaseModelVo } from "../../base/model.vo";
import { TrackTimeVo } from "../../track-time/track-time.vo";

export enum TaskStatus {
  TODO = "todo",
  DOING = "doing",
  DONE = "done",
  ABANDONED = "abandoned",
}

export type TaskModelVo = {
  name: string;

  parentId?: string;

  status: TaskStatus;

  description?: string;

  tags?: string[];

  importance?: number;

  urgency?: number;

  planStartAt?: string;

  planEndAt?: string;

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
  };
