import { IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { PartialType, PickType, IntersectionType } from 'francis-mapped-types';
import { TrackTimeFilterVo, TrackTimePageFilterVo } from '@true-north/vo';
import { TrackTimeDto } from './track-time-model.dto';
import { PageFilterDto } from '@true-north/plugin-sdk/main';
import { BaseFilterDto, importBaseVo } from '@true-north/plugin-sdk/main';

// 列表过滤DTO - 选择可过滤的字段
export class TrackTimeFilterDto extends IntersectionType(
  BaseFilterDto,
  PartialType(PickType(TrackTimeDto, ['relatedType', 'relatedId'] as const))
) {
  /** 开始时间范围 - 开始 */
  @IsDateString()
  @IsOptional()
  startAtStart?: string;

  /** 开始时间范围 - 结束 */
  @IsDateString()
  @IsOptional()
  startAtEnd?: string;

  /** 结束时间范围 - 开始 */
  @IsDateString()
  @IsOptional()
  endAtStart?: string;

  /** 结束时间范围 - 结束 */
  @IsDateString()
  @IsOptional()
  endAtEnd?: string;

  /** 最小时长 */
  @IsNumber()
  @IsOptional()
  minDuration?: number;

  /** 最大时长 */
  @IsNumber()
  @IsOptional()
  maxDuration?: number;

  /** 时间记录ID */
  @IsString()
  @IsOptional()
  id?: string;

  importListVo(filterVo: TrackTimeFilterVo) {
    importVo(filterVo, this);
  }
}

// 分页过滤DTO - 继承列表过滤 + 分页
export class TrackTimePageFilterDto extends IntersectionType(PageFilterDto, TrackTimeFilterDto) {
  importPageVo(filterVo: TrackTimePageFilterVo) {
    importVo(filterVo, this);
    this.pageNum = filterVo.pageNum;
    this.pageSize = filterVo.pageSize;
  }
}

function importVo(filterVo: TrackTimeFilterVo, filterDto: TrackTimeFilterDto) {
  importBaseVo(filterVo, filterDto);
  if (filterVo.relatedType !== undefined) filterDto.relatedType = filterVo.relatedType;
  if (filterVo.relatedId !== undefined) filterDto.relatedId = filterVo.relatedId;
  if (filterVo.startAtStart) filterDto.startAtStart = filterVo.startAtStart;
  if (filterVo.startAtEnd) filterDto.startAtEnd = filterVo.startAtEnd;
  if (filterVo.endAtStart) filterDto.endAtStart = filterVo.endAtStart;
  if (filterVo.endAtEnd) filterDto.endAtEnd = filterVo.endAtEnd;
  if (filterVo.minDuration !== undefined) filterDto.minDuration = filterVo.minDuration;
  if (filterVo.maxDuration !== undefined) filterDto.maxDuration = filterVo.maxDuration;
  if (filterVo.id) filterDto.id = filterVo.id;
}
