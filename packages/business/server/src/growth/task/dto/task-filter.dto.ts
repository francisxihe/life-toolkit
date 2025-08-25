import { PageDto } from "../../../base/page.dto";
import { TaskDto } from "./task-model.dto";
import {
  PickType,
  IntersectionType,
  PartialType,
} from "@life-toolkit/mapped-types";
import { TaskListFiltersVo } from "@life-toolkit/vo/growth/task";

export class TaskListFilterDto extends PartialType(
  PickType(TaskDto, [
    "importance",
    "urgency",
    "status",
  ] as const)
) {
  /** 搜索关键词 */
  keyword?: string;

  startDateStart?: Date;

  startDateEnd?: Date;

  endDateStart?: Date;

  endDateEnd?: Date;

  /** 完成开始日期 */
  doneDateStart?: Date;

  /** 完成结束日期 */
  doneDateEnd?: Date;

  /** 放弃开始日期 */
  abandonedDateStart?: Date;

  /** 放弃结束日期 */
  abandonedDateEnd?: Date;

  /** 目标ID */
  goalIds?: string[];

  /** 不包含自身 */
  withoutSelf?: boolean;

  /** 任务ID */
  id?: string;

  importListVo(filterVo: TaskListFiltersVo) {
    importListVo(filterVo, this);
  }
}

export class TaskPageFilterDto extends IntersectionType(
  PageDto,
  TaskListFilterDto
) {}

function importListVo(
  filterVo: TaskListFiltersVo,
  filterDto: TaskListFilterDto
) {
  if (filterVo.status !== undefined) filterDto.status = filterVo.status;
  if (filterVo.importance !== undefined)
    filterDto.importance = filterVo.importance;
  if (filterVo.keyword) filterDto.keyword = filterVo.keyword;
  if (filterVo.startDateStart)
    filterDto.startDateStart = new Date(filterVo.startDateStart);
  if (filterVo.startDateEnd)
    filterDto.startDateEnd = new Date(filterVo.startDateEnd);
  if (filterVo.endDateStart)
    filterDto.endDateStart = new Date(filterVo.endDateStart);
  if (filterVo.endDateEnd)
    filterDto.endDateEnd = new Date(filterVo.endDateEnd);
  if (filterVo.doneDateStart)
    filterDto.doneDateStart = new Date(filterVo.doneDateStart);
  if (filterVo.doneDateEnd)
    filterDto.doneDateEnd = new Date(filterVo.doneDateEnd);
  if (filterVo.abandonedDateStart)
    filterDto.abandonedDateStart = new Date(filterVo.abandonedDateStart);
  if (filterVo.abandonedDateEnd)
    filterDto.abandonedDateEnd = new Date(filterVo.abandonedDateEnd);
}
