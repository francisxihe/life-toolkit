import { PageDto } from "../../../base/page.dto";
import { HabitDto } from "./habit-model.dto";
import {
  PickType,
  IntersectionType,
  PartialType,
} from "@life-toolkit/mapped-types";
import {
  HabitListFiltersVo,
  HabitPageFiltersVo,
} from "@life-toolkit/vo/growth/habit";

export class HabitListFiltersDto extends PartialType(
  PickType(HabitDto, ["status", "difficulty", "tags", "importance"] as const)
) {
  /** 搜索关键词 */
  keyword?: string;

  /** 开始日期范围 - 开始 */
  startDateStart?: Date;

  /** 开始日期范围 - 结束 */
  startDateEnd?: Date;

  /** 目标日期范围 - 开始 */
  endDataStart?: Date;

  /** 目标日期范围 - 结束 */
  endDataEnd?: Date;

  /** 不包含自身 */
  withoutSelf?: boolean;

  /** 习惯ID */
  id?: string;

  /** 目标ID */
  goalId?: string;

  importListVo(filterVo: HabitListFiltersVo) {
    importListVo(filterVo, this);
  }
}

export class HabitPageFiltersDto extends IntersectionType(
  PageDto,
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
    filterDto.importance = filterVo.importance;
  if (filterVo.keyword) filterDto.keyword = filterVo.keyword;
  if (filterVo.startDateStart)
    filterDto.startDateStart = new Date(filterVo.startDateStart);
  if (filterVo.startDateEnd)
    filterDto.startDateEnd = new Date(filterVo.startDateEnd);
  if (filterVo.endDataStart)
    filterDto.endDataStart = new Date(filterVo.endDataStart);
  if (filterVo.endDataEnd)
    filterDto.endDataEnd = new Date(filterVo.endDataEnd);
}
