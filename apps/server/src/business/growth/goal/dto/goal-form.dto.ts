import { Goal } from "../entities";
import { PartialType, IntersectionType, PickType } from "@nestjs/mapped-types";
import { GoalDto } from "./goal-model.dto";

// 创建DTO - 选择需要的字段
export class CreateGoalDto extends PickType(GoalDto, [
  "name",
  "type",
  "startAt",
  "endAt",
  "description",
  "importance",
  "urgency",
] as const) {
  // 额外字段
  parentId?: string;
}

// 更新DTO - 基于创建DTO的部分字段 + 状态字段
export class UpdateGoalDto extends PartialType(CreateGoalDto) {
  // 状态相关字段
  status?: Goal["status"];
  doneAt?: Date;
  abandonedAt?: Date;
}
