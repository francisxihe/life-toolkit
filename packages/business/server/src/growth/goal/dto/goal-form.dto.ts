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
import type { Goal as GoalVO } from "@life-toolkit/vo";
import dayjs from "dayjs";

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

  // VO → DTO
  importVo(vo: GoalVO.CreateGoalVo) {
    this.name = vo.name;
    this.description = vo.description;
    this.type = vo.type;
    this.importance = vo.importance;
    this.difficulty = vo.difficulty;
    this.parentId = vo.parentId;
    
    // 日期字段转换 (string → Date)
    this.startAt = vo.startAt ? dayjs(vo.startAt).toDate() : undefined;
    this.endAt = vo.endAt ? dayjs(vo.endAt).toDate() : undefined;
  }

  // VO → DTO (静态方法)
  static importVo(vo: GoalVO.CreateGoalVo): CreateGoalDto {
    const dto = new CreateGoalDto();
    dto.importVo(vo);
    return dto;
  }

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
  PartialType(OmitType(CreateGoalDto, ["importVo"] as const)),
  PickType(Goal, ["id"] as const),
  PickType(GoalDto, ["doneAt", "abandonedAt"] as const)
) {

  // VO → DTO
  importVo(vo: GoalVO.UpdateGoalVo) {
    // 只更新提供的字段
    if (vo.name !== undefined) this.name = vo.name;
    if (vo.description !== undefined) this.description = vo.description;
    if (vo.type !== undefined) this.type = vo.type;
    if (vo.importance !== undefined) this.importance = vo.importance;
    if (vo.difficulty !== undefined) this.difficulty = vo.difficulty;
    if (vo.parentId !== undefined) this.parentId = vo.parentId;
    
    // 日期字段转换 (string → Date)
    if (vo.startAt !== undefined) {
      this.startAt = vo.startAt ? dayjs(vo.startAt).toDate() : undefined;
    }
    if (vo.endAt !== undefined) {
      this.endAt = vo.endAt ? dayjs(vo.endAt).toDate() : undefined;
    }
  }

  // VO → DTO (静态方法)
  static importVo(vo: GoalVO.UpdateGoalVo): UpdateGoalDto {
    const dto = new UpdateGoalDto();
    dto.importVo(vo);
    return dto;
  }

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
