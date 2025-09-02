import { PageFilterDto } from "../../../common/filter";
import { HabitDto } from "./habit-model.dto";
import {
  PickType,
  IntersectionType,
  PartialType,
} from "@life-toolkit/mapped-types";
import {
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  IsDateString,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";
import {
  HabitListFiltersVo,
  HabitPageFiltersVo,
} from "@life-toolkit/vo/growth/habit";
import { HabitStatus, Importance, Difficulty } from "@life-toolkit/enum";

export class HabitListFiltersDto extends PartialType(
  PickType(HabitDto, ["status", "difficulty", "tags", "importance"] as const)
) {
  /** 搜索关键词 */
  @IsString()
  @IsOptional()
  keyword?: string;

  /** 开始日期范围 - 开始 */
  @IsDateString()
  @IsOptional()
  startDateStart?: string;

  /** 开始日期范围 - 结束 */
  @IsDateString()
  @IsOptional()
  startDateEnd?: string;

  /** 目标日期范围 - 开始 */
  @IsDateString()
  @IsOptional()
  endDateStart?: string;

  /** 目标日期范围 - 结束 */
  @IsDateString()
  @IsOptional()
  endDateEnd?: string;

  excludeIds?: string[];

  /** 习惯ID */
  @IsString()
  @IsOptional()
  id?: string;

  /** 目标ID */
  @IsString()
  @IsOptional()
  goalId?: string;

  importListVo(filterVo: HabitListFiltersVo) {
    importListVo(filterVo, this);
  }
}

export class HabitPageFiltersDto extends IntersectionType(
  PageFilterDto,
  HabitListFiltersDto
) {
  importPageVo(filterVo: HabitPageFiltersVo) {
    importListVo(filterVo, this);
    this.pageNum = filterVo.pageNum;
    this.pageSize = filterVo.pageSize;
  }
}

function importListVo(
  filterVo: HabitListFiltersVo,
  filterDto: HabitListFiltersDto
) {
  if (filterVo.status !== undefined) filterDto.status = filterVo.status;
  if (filterVo.difficulty !== undefined)
    filterDto.difficulty = filterVo.difficulty;
  if (filterVo.importance !== undefined)
    filterDto.importance = filterVo.importance as Importance;
  if (filterVo.tags) filterDto.tags = filterVo.tags;
  if (filterVo.keyword) filterDto.keyword = filterVo.keyword;
  if (filterVo.startDateStart)
    filterDto.startDateStart = filterVo.startDateStart;
  if (filterVo.startDateEnd) filterDto.startDateEnd = filterVo.startDateEnd;
  // if (filterVo.endDateStart) filterDto.endDateStart = filterVo.endDateStart;
  // if (filterVo.endDateEnd) filterDto.endDateEnd = filterVo.endDateEnd;
  if (filterVo.excludeIds) filterDto.excludeIds = filterVo.excludeIds;
}
