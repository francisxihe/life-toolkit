import { PageFilterDto } from '../../../common/filter';
import { TodoDto } from './todo-model.dto';
import { PickType, IntersectionType, PartialType } from '@life-toolkit/mapped-types';
import { TodoListFiltersVo, TodoPageFiltersVo } from '@life-toolkit/vo';
import { BaseFilterDto, importBaseVo } from '@business/common/filter';

export class TodoListFilterDto extends IntersectionType(
  BaseFilterDto,
  PartialType(PickType(TodoDto, ['importance', 'urgency', 'status', 'taskId'] as const))
) {
  planDateStart?: string;

  planDateEnd?: string;

  doneDateStart?: string;

  doneDateEnd?: string;

  abandonedDateStart?: string;

  abandonedDateEnd?: string;

  taskIds?: string[];

  importListVo(filterVo: TodoListFiltersVo) {
    importVo(filterVo, this);
  }
}

export class TodoPageFiltersDto extends IntersectionType(PageFilterDto, TodoListFilterDto) {
  importPageVo(filterVo: TodoPageFiltersVo) {
    importVo(filterVo, this);
    this.pageNum = filterVo.pageNum;
    this.pageSize = filterVo.pageSize;
  }
}

function importVo(filterVo: TodoListFiltersVo, filterDto: TodoListFilterDto) {
  importBaseVo(filterVo, filterDto);
  filterDto.importance = filterVo.importance;
  filterDto.urgency = filterVo.urgency;
  filterDto.status = filterVo.status;
  filterDto.planDateStart = filterVo.planDateStart;
  filterDto.planDateEnd = filterVo.planDateEnd;
  filterDto.doneDateStart = filterVo.doneDateStart;
  filterDto.doneDateEnd = filterVo.doneDateEnd;
  filterDto.abandonedDateStart = filterVo.abandonedDateStart;
  filterDto.abandonedDateEnd = filterVo.abandonedDateEnd;
  filterDto.includeIds = filterVo.includeIds;
}
