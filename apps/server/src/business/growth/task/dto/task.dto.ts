import { Task } from "../entities";
import { BaseModelDto, BaseModelDtoKeys } from "@/base/base-model.dto";
import {
  OmitType,
  PartialType,
  IntersectionType,
  PickType,
} from "@nestjs/mapped-types";
import { TrackTimeDto } from "../../track-time";

export class TaskDto extends IntersectionType(
  BaseModelDto,
  PickType(Task, [
    "name",
    "description",
    "status",
    "tags",
    "importance",
    "urgency",
    "startAt",
    "endAt",
    "doneAt",
    "abandonedAt",
    "estimateTime",
    "children",
    "parent",
    "goal",
  ] as const)
) {}

export class CreateTaskDto extends OmitType(TaskDto, [
  "status",
  "doneAt",
  "abandonedAt",
  ...BaseModelDtoKeys,
] as const) {
  trackTimeIds?: string[];
  parentId?: string;
}

export class UpdateTaskDto extends IntersectionType(
  PartialType(CreateTaskDto),
  PickType(Task, ["id"] as const)
) {}

export class TaskWithTrackTimeDto extends IntersectionType(
  TaskDto,
  PickType(Task, [] as const)
) {
  trackTimeList: TrackTimeDto[];
}
