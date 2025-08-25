import { PageFilterDto } from "../../../common/filter";
import { GoalDto } from "./goal-model.dto";
import {
  PickType,
  IntersectionType,
  PartialType,
} from "@life-toolkit/mapped-types";
import {
  GoalListFiltersVo,
  GoalPageFiltersVo,
} from "@life-toolkit/vo/growth/goal";

// 列表过滤DTO - 选择可过滤的字段
export class GoalListFilterDto extends PartialType(
  PickType(GoalDto, ["type", "importance"] as const)
) {
  status?: GoalDto["status"];

  /** 搜索关键词 */
  keyword?: string;

  /** 计划开始日期 */
  planDateStart?: Date;

  /** 计划结束日期 */
  planDateEnd?: Date;

  /** 完成开始日期 */
  doneDateStart?: Date;

  /** 完成结束日期 */
  doneDateEnd?: Date;

  /** 放弃开始日期 */
  abandonedDateStart?: Date;

  /** 放弃结束日期 */
  abandonedDateEnd?: Date;

  /** 排除自身 */
  withoutSelf?: boolean;

  /** 目标ID */
  id?: string;

  /** 父目标ID */
  parentId?: string;

  /** 开始时间过滤 */
  startAt?: Date;

  /** 结束时间过滤 */
  endAt?: Date;

  importListVo(filterVo: GoalListFiltersVo) {
    importListVo(filterVo, this);
  }
}

// 分页过滤DTO - 继承列表过滤 + 分页
export class GoalPageFilterDto extends IntersectionType(
  PageFilterDto,
  GoalListFilterDto
) {
  importPageVo(filterVo: GoalPageFiltersVo) {
    importListVo(filterVo, this);
    this.pageNum = filterVo.pageNum;
    this.pageSize = filterVo.pageSize;
  }
}

function importListVo(
  filterVo: GoalListFiltersVo,
  filterDto: GoalListFilterDto
) {
  if (filterVo.id) filterDto.id = filterVo.id;
  if (filterVo.withoutSelf !== undefined)
    filterDto.withoutSelf = filterVo.withoutSelf;
  if (filterVo.status !== undefined) filterDto.status = filterVo.status;
  if (filterVo.type !== undefined) filterDto.type = filterVo.type;
  if (filterVo.importance !== undefined)
    filterDto.importance = filterVo.importance;
  if (filterVo.keyword) filterDto.keyword = filterVo.keyword;
  if (filterVo.startAt) filterDto.startAt = new Date(filterVo.startAt);
  if (filterVo.endAt) filterDto.endAt = new Date(filterVo.endAt);
  if (filterVo.doneDateStart)
    filterDto.doneDateStart = new Date(filterVo.doneDateStart);
  if (filterVo.doneDateEnd)
    filterDto.doneDateEnd = new Date(filterVo.doneDateEnd);
  if (filterVo.abandonedDateStart)
    filterDto.abandonedDateStart = new Date(filterVo.abandonedDateStart);
  if (filterVo.abandonedDateEnd)
    filterDto.abandonedDateEnd = new Date(filterVo.abandonedDateEnd);
  if (filterVo.parentId) filterDto.parentId = filterVo.parentId;
}
