import { Goal } from "../entities";
import { BaseModelDto } from "@/base/base-model.dto";
import { OmitType, IntersectionType } from "@nestjs/mapped-types";

// 基础DTO - 包含所有字段
export class GoalDto extends IntersectionType(BaseModelDto, Goal) {}

// 模型DTO - 排除关联字段
export class GoalModelDto extends OmitType(GoalDto, [
  "children",
  "parent",
  "taskList",
] as const) {}
