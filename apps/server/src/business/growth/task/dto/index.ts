export * from "./task-form.dto";
export * from "./task-filter.dto";
export * from "./task-model.dto";

import { Task } from "../entities";
import { TrackTimeDto } from "../../track-time";
import { IntersectionType, PickType } from "@nestjs/mapped-types";
import { TaskModelDto } from "./task-model.dto";

export class TaskWithTrackTimeDto extends IntersectionType(
  TaskModelDto,
  PickType(Task, [] as const)
) {
  trackTimeList: TrackTimeDto[];
}
