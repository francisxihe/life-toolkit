import { PageFilterDto } from "../../../common/filter";
import { TaskDto } from "./task-model.dto";
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
  IsNumber,
  IsDateString,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";
import { TaskListFiltersVo, TaskPageFiltersVo } from "@life-toolkit/vo/growth/task";
import { TaskStatus } from "@life-toolkit/enum";

export class TaskListFiltersDto extends PartialType(
  PickType(TaskDto, [
    "importance",
    "urgency",
    "status",
  ] as const)
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

  /** 结束日期范围 - 开始 */
  @IsDateString()
  @IsOptional()
  endDateStart?: string;

  /** 结束日期范围 - 结束 */
  @IsDateString()
  @IsOptional()
  endDateEnd?: string;

  /** 完成开始日期 */
  @IsDateString()
  @IsOptional()
  doneDateStart?: string;

  /** 完成结束日期 */
  @IsDateString()
  @IsOptional()
  doneDateEnd?: string;

  /** 放弃开始日期 */
  @IsDateString()
  @IsOptional()
  abandonedDateStart?: string;

  /** 放弃结束日期 */
  @IsDateString()
  @IsOptional()
  abandonedDateEnd?: string;

  /** 目标ID列表 */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  goalIds?: string[];

  excludeIds?: string[];

  /** 任务ID */
  @IsString()
  @IsOptional()
  id?: string;

  importListVo(filterVo: TaskListFiltersVo) {
    importListVo(filterVo, this);
  }
}

export class TaskPageFiltersDto extends IntersectionType(
  PageFilterDto,
  TaskListFiltersDto
) {
  importPageVo(filterVo: TaskPageFiltersVo) {
    importListVo(filterVo, this);
    this.pageNum = filterVo.pageNum;
    this.pageSize = filterVo.pageSize;
  }
}

function importListVo(
  filterVo: TaskListFiltersVo,
  filterDto: TaskListFiltersDto
) {
  if (filterVo.status !== undefined) filterDto.status = filterVo.status;
  if (filterVo.importance !== undefined) filterDto.importance = filterVo.importance;
  if (filterVo.urgency !== undefined) filterDto.urgency = filterVo.urgency;
  if (filterVo.keyword) filterDto.keyword = filterVo.keyword;
  if (filterVo.startDateStart) filterDto.startDateStart = filterVo.startDateStart;
  if (filterVo.startDateEnd) filterDto.startDateEnd = filterVo.startDateEnd;
  if (filterVo.endDateStart) filterDto.endDateStart = filterVo.endDateStart;
  if (filterVo.endDateEnd) filterDto.endDateEnd = filterVo.endDateEnd;
  if (filterVo.doneDateStart) filterDto.doneDateStart = filterVo.doneDateStart;
  if (filterVo.doneDateEnd) filterDto.doneDateEnd = filterVo.doneDateEnd;
  if (filterVo.abandonedDateStart) filterDto.abandonedDateStart = filterVo.abandonedDateStart;
  if (filterVo.abandonedDateEnd) filterDto.abandonedDateEnd = filterVo.abandonedDateEnd;
  if (filterVo.excludeIds) filterDto.excludeIds = filterVo.excludeIds;
}
