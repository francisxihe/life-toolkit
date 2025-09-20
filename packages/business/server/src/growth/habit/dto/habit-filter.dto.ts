import { PageFilterDto } from '../../../common';
import { HabitDto } from './habit-model.dto';
import { PickType, IntersectionType, PartialType } from 'francis-mapped-types';
import { IsOptional, IsString, IsArray, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { HabitFilterVo, HabitPageFilterVo } from '@life-toolkit/vo';
import { HabitStatus, Importance, Difficulty } from '@life-toolkit/enum';
import { BaseFilterDto, importBaseVo } from '@business/common';

export class HabitFilterDto extends IntersectionType(
  BaseFilterDto,
  PartialType(PickType(HabitDto, ['status', 'difficulty', 'tags', 'importance'] as const))
) {
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

  /** 习惯ID */
  @IsString()
  @IsOptional()
  id?: string;

  /** 目标ID */
  @IsString()
  @IsOptional()
  goalId?: string;

  importListVo(filterVo: HabitFilterVo) {
    importVo(filterVo, this);
  }
}

export class HabitPageFilterDto extends IntersectionType(PageFilterDto, HabitFilterDto) {
  importPageVo(filterVo: HabitPageFilterVo) {
    importVo(filterVo, this);
    this.pageNum = filterVo.pageNum;
    this.pageSize = filterVo.pageSize;
  }
}

function importVo(filterVo: HabitFilterVo, filterDto: HabitFilterDto) {
  importBaseVo(filterVo, filterDto);
  if (filterVo.status !== undefined) filterDto.status = filterVo.status;
  if (filterVo.difficulty !== undefined) filterDto.difficulty = filterVo.difficulty;
  if (filterVo.importance !== undefined) filterDto.importance = filterVo.importance as Importance;
  if (filterVo.tags) filterDto.tags = filterVo.tags;
  if (filterVo.startDateStart) filterDto.startDateStart = filterVo.startDateStart;
  if (filterVo.startDateEnd) filterDto.startDateEnd = filterVo.startDateEnd;
}
