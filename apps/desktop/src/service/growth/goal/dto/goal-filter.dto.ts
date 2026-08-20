import { IsOptional, IsString, IsDateString, IsBoolean, IsArray } from 'class-validator';
import { PickType, IntersectionType, PartialType } from 'francis-mapped-types';
import { GoalFilterVo, GoalPageFilterVo } from '@true-north/vo';
import { GoalDto } from './goal-model.dto';
import { PageFilterDto } from '../../../common';
import { BaseFilterDto, importBaseVo } from '@business/common';
import { GoalStatus } from '@true-north/enum';

// 列表过滤DTO - 选择可过滤的字段
export class GoalFilterDto extends IntersectionType(
  BaseFilterDto,
  PartialType(PickType(GoalDto, ['type', 'importance', 'difficulty'] as const))
) {
  /** 目标状态 - 支持单个或数组 */
  @IsOptional()
  status?: GoalStatus | GoalStatus[];
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

  /** 目标ID */
  @IsString()
  @IsOptional()
  id?: string;

  /** 父目标ID */
  @IsString()
  @IsOptional()
  parentId?: string;

  /** 只获取根级目标（没有父目标的目标） */
  @IsBoolean()
  @IsOptional()
  onlyRootLevel?: boolean;

  importListVo(filterVo: GoalFilterVo) {
    importVo(filterVo, this);
  }
}

// 分页过滤DTO - 继承列表过滤 + 分页
export class GoalPageFilterDto extends IntersectionType(PageFilterDto, GoalFilterDto) {
  importPageVo(filterVo: GoalPageFilterVo) {
    importVo(filterVo, this);
    this.pageNum = filterVo.pageNum;
    this.pageSize = filterVo.pageSize;
  }
}

function importVo(filterVo: GoalFilterVo, filterDto: GoalFilterDto) {
  importBaseVo(filterVo, filterDto);
  if (filterVo.status !== undefined) filterDto.status = filterVo.status;
  if (filterVo.type !== undefined) filterDto.type = filterVo.type;
  if (filterVo.importance !== undefined) filterDto.importance = filterVo.importance;
  if (filterVo.difficulty !== undefined) filterDto.difficulty = filterVo.difficulty;
  if (filterVo.startDateStart) filterDto.startDateStart = filterVo.startDateStart;
  if (filterVo.startDateEnd) filterDto.startDateEnd = filterVo.startDateEnd;
  if (filterVo.endDateStart) filterDto.endDateStart = filterVo.endDateStart;
  if (filterVo.endDateEnd) filterDto.endDateEnd = filterVo.endDateEnd;
  if (filterVo.doneDateStart) filterDto.doneDateStart = filterVo.doneDateStart;
  if (filterVo.doneDateEnd) filterDto.doneDateEnd = filterVo.doneDateEnd;
  if (filterVo.abandonedDateStart) filterDto.abandonedDateStart = filterVo.abandonedDateStart;
  if (filterVo.abandonedDateEnd) filterDto.abandonedDateEnd = filterVo.abandonedDateEnd;
  if (filterVo.parentId) filterDto.parentId = filterVo.parentId;
  if (filterVo.onlyRootLevel !== undefined) filterDto.onlyRootLevel = filterVo.onlyRootLevel;
}
