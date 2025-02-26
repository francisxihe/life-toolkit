import { Goal } from "../entities";
import { BaseModelDto, BaseModelDtoKeys } from "@/base/base-model.dto";
import {
  OmitType,
  PartialType,
  IntersectionType,
  PickType,
} from "@nestjs/mapped-types";
import { TrackTimeDto } from "../../track-time";

export class GoalDto extends IntersectionType(
  BaseModelDto,
  PickType(Goal, [
    "name",
    "description",
    "status",
    "importance",
    "urgency",
    "startAt",
    "endAt",
    "doneAt",
    "abandonedAt",
    "children",
    "parent",
  ] as const)
) {}

export class CreateGoalDto extends OmitType(GoalDto, [
  "status",
  "doneAt",
  "abandonedAt",
  ...BaseModelDtoKeys,
] as const) {
  trackTimeIds?: string[];
  parentId?: string;
}

export class UpdateGoalDto extends IntersectionType(
  PartialType(CreateGoalDto),
  PickType(Goal, ["id"] as const)
) {}

export class GoalWithTrackTimeDto extends IntersectionType(
  GoalDto,
  PickType(Goal, [] as const)
) {
  trackTimeList: TrackTimeDto[];
}
