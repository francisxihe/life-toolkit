import { IsOptional, IsString, IsArray, IsEnum } from "class-validator";
import { PageDto } from "../../../base/page.dto";
import { HabitDto } from "./habit-model.dto";
import {
  PickType,
  IntersectionType,
  PartialType,
} from "@life-toolkit/mapped-types";
import { HabitListFiltersVo } from "@life-toolkit/vo/growth/habit";

export class HabitListFiltersDto extends PartialType(
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

  importVo(filterVo: HabitListFiltersVo) {
    if (filterVo.status !== undefined) this.status = filterVo.status;
    if (filterVo.difficulty !== undefined)
      this.difficulty = filterVo.difficulty;
    if (filterVo.importance !== undefined)
      this.importance = filterVo.importance;
    if (filterVo.keyword) this.keyword = filterVo.keyword;
    if (filterVo.startDateStart) this.startDateStart = filterVo.startDateStart;
    if (filterVo.startDateEnd) this.startDateEnd = filterVo.startDateEnd;
  }
}

export class HabitPageFiltersDto extends IntersectionType(
  PageDto,
  HabitListFiltersDto
) {}

// 为了向后兼容，保留旧的命名
export class HabitFilterDto extends HabitListFiltersDto {}
