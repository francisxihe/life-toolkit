import { Goal } from "../goal.entity";
import { PartialType, PickType } from "@life-toolkit/mapped-types";
import { GoalDto } from "./goal-model.dto";

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
  // 额外字段
  parentId?: string;

  applyToCreateEntity(entity: Goal) {
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

// 更新DTO - 基于创建DTO的部分字段 + 状态字段
export class UpdateGoalDto extends PartialType(CreateGoalDto) {
  // 状态相关字段
  doneAt?: Date;
  abandonedAt?: Date;

  applyToUpdateEntity(entity: Goal) {
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
