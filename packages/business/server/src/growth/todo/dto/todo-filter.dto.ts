import { PageFilterDto } from '../../../common';
import { TodoDto } from './todo-model.dto';
import { PickType, IntersectionType, PartialType } from '@life-toolkit/mapped-types';
import { TodoFilterVo, TodoPageFilterVo } from '@life-toolkit/vo';
import { BaseFilterDto, importBaseVo } from '@business/common';
import { TodoSource } from '@life-toolkit/enum';

export class TodoFilterDto extends IntersectionType(
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

  todoWithRepeatList?: {
    id: string;
    source: TodoSource;
  }[];

  importListVo(filterVo: TodoFilterVo) {
    importVo(filterVo, this);
  }
}

export class TodoPageFilterDto extends IntersectionType(PageFilterDto, TodoFilterDto) {
  importPageVo(filterVo: TodoPageFilterVo) {
    importVo(filterVo, this);
    this.pageNum = filterVo.pageNum;
    this.pageSize = filterVo.pageSize;
  }
}

function importVo(filterVo: TodoFilterVo, filterDto: TodoFilterDto) {
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
  filterDto.todoWithRepeatList = filterVo.todoWithRepeatList;
}
