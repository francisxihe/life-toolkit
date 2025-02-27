import { Goal } from "../entities";
import { BaseModelDto, BaseModelDtoKeys } from "@/base/base-model.dto";
import {
  OmitType,
  PartialType,
  IntersectionType,
  PickType,
} from "@nestjs/mapped-types";

export class GoalDto extends IntersectionType(
  BaseModelDto,
  OmitType(Goal, [] as const)
) {}

export class GoalModelDto extends OmitType(GoalDto, [
  "children",
  "parent",
] as const) {}

export class CreateGoalDto extends OmitType(GoalDto, [
  "status",
  "doneAt",
  "abandonedAt",
  ...BaseModelDtoKeys,
] as const) {
  parentId?: string;
}

export class UpdateGoalDto extends IntersectionType(
  PartialType(CreateGoalDto),
  PickType(Goal, ["id"] as const)
) {}
