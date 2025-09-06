import {
  PartialType,
  IntersectionType,
  PickType,
  OmitType,
} from "@life-toolkit/mapped-types";
import {
  IsOptional,
  IsArray,
  IsString,
  IsEnum,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";
import { HabitDto } from "./habit-model.dto";
import { Habit } from "../habit.entity";
import { HabitStatus, Importance, Difficulty } from "@life-toolkit/enum";
import type { Habit as HabitVO } from "@life-toolkit/vo";
import dayjs from "dayjs";

export class CreateHabitDto extends PickType(HabitDto, [
  "name",
  "description",
  "importance",
  "tags",
  "difficulty",
  "startDate",
  "targetDate",
] as const) {
  /** 目标ID列表 */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  goalIds?: string[];

  importVo(vo: HabitVO.CreateHabitVo) {
    this.name = vo.name;
    this.description = vo.description;
    this.importance = vo.importance;
    this.tags = vo.tags || [];
    this.difficulty = vo.difficulty as any;
    if (vo.startAt) {
      this.startDate = dayjs(vo.startAt).toDate();
    }
    if (vo.endAt) {
      this.targetDate = dayjs(vo.endAt).toDate();
    }
    this.goalIds = vo.goalIds;
  }

  appendToCreateEntity(entity: Habit) {
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.difficulty !== undefined) entity.difficulty = this.difficulty;
    if (this.startDate !== undefined) entity.startDate = this.startDate;
    if (this.targetDate !== undefined) entity.targetDate = this.targetDate;
  }
}

export class UpdateHabitDto extends IntersectionType(
  PartialType(OmitType(CreateHabitDto, ["goalIds"] as const)),
  PickType(Habit, ["id"] as const),
  PickType(HabitDto, [
    "status",
    "currentStreak",
    "longestStreak",
    "completedCount",
  ] as const)
) {
  /** 目标ID列表 */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  goalIds?: string[];
  importVo(vo: HabitVO.UpdateHabitVo) {
    if (vo.name !== undefined) this.name = vo.name;
    if (vo.description !== undefined) this.description = vo.description;
    if (vo.importance !== undefined) this.importance = vo.importance;
    if (vo.tags !== undefined) this.tags = vo.tags || [];
    if (vo.difficulty !== undefined) this.difficulty = vo.difficulty as any;
    if (vo.startAt !== undefined) {
      this.startDate = vo.startAt ? dayjs(vo.startAt).toDate() : undefined;
    }
    if (vo.endAt !== undefined) {
      this.targetDate = vo.endAt ? dayjs(vo.endAt).toDate() : undefined;
    }
    if (vo.status !== undefined) this.status = vo.status as any;
  }

  appendToUpdateEntity(entity: Habit) {
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.difficulty !== undefined) entity.difficulty = this.difficulty;
    if (this.startDate !== undefined) entity.startDate = this.startDate;
    if (this.targetDate !== undefined) entity.targetDate = this.targetDate;
    if (this.status !== undefined) entity.status = this.status;
    if (this.currentStreak !== undefined)
      entity.currentStreak = this.currentStreak;
    if (this.longestStreak !== undefined)
      entity.longestStreak = this.longestStreak;
    if (this.completedCount !== undefined)
      entity.completedCount = this.completedCount;
  }
}
