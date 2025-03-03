import { Goal } from "../entities";
import { BaseModelDto, BaseModelDtoKeys } from "@/base/base-model.dto";
import {
  OmitType,
  PartialType,
  IntersectionType,
  PickType,
} from "@nestjs/mapped-types";
import { GoalDto } from "./goal-model.dto";

export class CreateGoalDto extends PickType(GoalDto, [
  "name",
  "status",
  "type",
  "doneAt",
  "startAt",
  "endAt",
  "abandonedAt",
  "description",
  "importance",
  "urgency",
  "parent",
] as const) {
  parentId?: string;
}

export class UpdateGoalDto extends IntersectionType(
  PartialType(CreateGoalDto),
  PickType(Goal, ["id"] as const)
) {}
