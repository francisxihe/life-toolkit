import { PageFilterDto } from '../../../common';
import { TodoDto } from './todo-model.dto';
import { PickType, IntersectionType, PartialType } from 'francis-mapped-types';
import { TodoFilterVo, TodoPageFilterVo } from '@true-north/vo';
import { BaseFilterDto, importBaseVo } from '@business/common';
import { TodoRelatedType } from '@true-north/enum';

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
    relatedType: TodoRelatedType;
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
  filterDto.taskIds = filterVo.taskIds;
  filterDto.includeIds = filterVo.includeIds;
  filterDto.todoWithRepeatList = filterVo.todoWithRepeatList;
}
