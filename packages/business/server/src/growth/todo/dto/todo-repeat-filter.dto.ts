import { PageFilterDto } from '../../../common';
import { TodoRepeatDto } from './todo-repeat-model.dto';
import { PickType, IntersectionType, PartialType } from '@life-toolkit/mapped-types';
import { BaseFilterDto, importBaseVo } from '@business/common';

export class TodoRepeatFilterDto extends IntersectionType(
  BaseFilterDto,
  PartialType(PickType(TodoRepeatDto, ['importance', 'urgency', 'status'] as const))
) {
  currentDateStart?: string;

  currentDateEnd?: string;

  abandonedDateStart?: string;

  abandonedDateEnd?: string;

  importListVo(filterVo: any) {
    importVo(filterVo, this);
  }
}

export class TodoRepeatPageFilterDto extends IntersectionType(PageFilterDto, TodoRepeatFilterDto) {
  importPageVo(filterVo: any) {
    importVo(filterVo, this);
    this.pageNum = filterVo.pageNum;
    this.pageSize = filterVo.pageSize;
  }
}

function importVo(filterVo: any, filterDto: TodoRepeatFilterDto) {
  importBaseVo(filterVo, filterDto);
  filterDto.importance = filterVo.importance;
  filterDto.urgency = filterVo.urgency;
  filterDto.status = filterVo.status;
  filterDto.currentDateStart = filterVo.currentDateStart;
  filterDto.currentDateEnd = filterVo.currentDateEnd;
  filterDto.abandonedDateStart = filterVo.abandonedDateStart;
  filterDto.abandonedDateEnd = filterVo.abandonedDateEnd;
}
