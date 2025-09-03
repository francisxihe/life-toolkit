import { IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';
import { PickType, IntersectionType, PartialType } from '@life-toolkit/mapped-types';
import { GoalListFiltersVo, GoalPageFiltersVo } from '@life-toolkit/vo/growth/goal';
import { GoalDto } from './goal-model.dto';
import { PageFilterDto } from '../../../common/filter';
import { BaseFilterDto, importBaseVo } from '@business/common/filter';

// 列表过滤DTO - 选择可过滤的字段
export class GoalListFiltersDto extends IntersectionType(
  BaseFilterDto,
  PartialType(PickType(GoalDto, ['type', 'importance', 'status'] as const))
) {
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

  importListVo(filterVo: GoalListFiltersVo) {
    importVo(filterVo, this);
  }
}

// 分页过滤DTO - 继承列表过滤 + 分页
export class GoalPageFiltersDto extends IntersectionType(PageFilterDto, GoalListFiltersDto) {
  importPageVo(filterVo: GoalPageFiltersVo) {
    importVo(filterVo, this);
    this.pageNum = filterVo.pageNum;
    this.pageSize = filterVo.pageSize;
  }
}

function importVo(filterVo: GoalListFiltersVo, filterDto: GoalListFiltersDto) {
  importBaseVo(filterVo, filterDto);
  if (filterVo.status !== undefined) filterDto.status = filterVo.status;
  if (filterVo.type !== undefined) filterDto.type = filterVo.type;
  if (filterVo.importance !== undefined) filterDto.importance = filterVo.importance;
  if (filterVo.doneDateStart) filterDto.doneDateStart = filterVo.doneDateStart;
  if (filterVo.doneDateEnd) filterDto.doneDateEnd = filterVo.doneDateEnd;
  if (filterVo.abandonedDateStart) filterDto.abandonedDateStart = filterVo.abandonedDateStart;
  if (filterVo.abandonedDateEnd) filterDto.abandonedDateEnd = filterVo.abandonedDateEnd;
  if (filterVo.parentId) filterDto.parentId = filterVo.parentId;
}
