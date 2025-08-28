import { Goal } from "../goal.entity";
import { PartialType, PickType, IntersectionType, OmitType } from "@life-toolkit/mapped-types";
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";
import { GoalDto } from "./goal-model.dto";
import { GoalType, GoalStatus, Importance, Difficulty } from "@life-toolkit/enum";

// 创建DTO - 选择需要的字段
export class CreateGoalDto extends PickType(GoalDto, [
  "name",
  "type",
  "startAt",
  "endAt",
  "description",
  "importance",
  "difficulty",
  "status",
] as const) {
  /** 父目标ID */
  @IsString()
  @IsOptional()
  parentId?: string;

  appendToCreateEntity(entity: Goal) {
    if (this.name !== undefined) entity.name = this.name;
    if (this.type !== undefined) entity.type = this.type;
    if (this.startAt !== undefined) entity.startAt = this.startAt;
    if (this.endAt !== undefined) entity.endAt = this.endAt;
    if (this.description !== undefined) entity.description = this.description;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.difficulty !== undefined) entity.difficulty = this.difficulty;
    if (this.status !== undefined) entity.status = this.status;
  }
}

// 更新DTO - 基于创建DTO的部分字段 + 实体ID + 状态字段
export class UpdateGoalDto extends IntersectionType(
  PartialType(OmitType(CreateGoalDto, ["parentId"] as const)),
  PickType(Goal, ["id"] as const),
  PickType(GoalDto, ["doneAt", "abandonedAt"] as const)
) {

  appendToUpdateEntity(entity: Goal) {
    if (this.name !== undefined) entity.name = this.name;
    if (this.type !== undefined) entity.type = this.type;
    if (this.startAt !== undefined) entity.startAt = this.startAt;
    if (this.endAt !== undefined) entity.endAt = this.endAt;
    if (this.description !== undefined) entity.description = this.description;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.difficulty !== undefined) entity.difficulty = this.difficulty;
    if (this.status !== undefined) entity.status = this.status;
    if (this.doneAt !== undefined) entity.doneAt = this.doneAt;
    if (this.abandonedAt !== undefined) entity.abandonedAt = this.abandonedAt;
  }
}
