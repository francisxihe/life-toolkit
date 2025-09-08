export * from "./task-form.dto";
export * from "./task-filter.dto";
export * from "./task-model.dto";

import { Task } from "../task.entity";
import { TrackTimeDto } from "../../track-time";
import { IntersectionType, PickType } from "@life-toolkit/mapped-types";
import { TaskWithoutRelationsDto } from "./task-model.dto";

export class TaskWithTrackTimeDto extends IntersectionType(
  TaskWithoutRelationsDto,
  PickType(Task, [] as const)
) {
  trackTimeList?: TrackTimeDto[];
}
