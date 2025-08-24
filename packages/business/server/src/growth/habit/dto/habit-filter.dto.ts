import { IsOptional, IsString, IsArray, IsEnum } from "class-validator";
import { PageDto } from "../../../base/page.dto";
import { HabitDto } from "./habit-model.dto";
import { PickType, IntersectionType, PartialType } from "@life-toolkit/mapped-types";
import { HabitStatus, HabitDifficulty } from "..";

export class HabitListFilterDto extends PartialType(
  PickType(HabitDto, ["status", "difficulty", "tags", "importance"] as const)
) {
  /** 搜索关键词 */
  keyword?: string;

  /** 开始日期范围 - 开始 */
  startDateStart?: string;

  /** 开始日期范围 - 结束 */
  startDateEnd?: string;

  /** 目标日期范围 - 开始 */
  targetDateStart?: string;

  /** 目标日期范围 - 结束 */
  targetDateEnd?: string;

  /** 不包含自身 */
  withoutSelf?: boolean;

  /** 习惯ID */
  id?: string;

  /** 目标ID */
  goalId?: string;
}

export class HabitPageFilterDto extends IntersectionType(
  PageDto,
  HabitListFilterDto
) {}

// 为了向后兼容，保留旧的命名
export class HabitFilterDto extends HabitListFilterDto {} 