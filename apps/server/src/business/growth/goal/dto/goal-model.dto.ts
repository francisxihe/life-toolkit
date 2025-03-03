import { Goal } from "../entities";
import { BaseModelDto } from "@/base/base-model.dto";
import { OmitType, IntersectionType } from "@nestjs/mapped-types";

export class GoalDto extends IntersectionType(BaseModelDto, Goal) {}

export class GoalModelDto extends OmitType(GoalDto, [
  "children",
  "parent",
  "taskList",
] as const) {}
