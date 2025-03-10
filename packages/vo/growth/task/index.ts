export * from "./task-filter.vo";
export * from "./task-form.vo";
export * from "./task-model.vo";

import { TaskVo } from "./task-model.vo";
import { TrackTimeVo } from "../track-time";

export type TaskWithTrackTimeVo = TaskVo & {
  trackTimeList: TrackTimeVo[];
};
