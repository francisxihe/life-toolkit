import { PageFilterDto } from "../../../common/filter";
import { TodoDto } from "./todo-model.dto";
import {
  PickType,
  IntersectionType,
  PartialType,
} from "@life-toolkit/mapped-types";
import { TodoListFiltersVo, TodoPageFiltersVo } from "@life-toolkit/vo";

export class TodoListFilterDto extends PartialType(
  PickType(TodoDto, ["importance", "urgency", "status", "taskId"] as const)
) {
  keyword?: string;

  planDateStart?: string;

  planDateEnd?: string;

  doneDateStart?: string;

  doneDateEnd?: string;

  abandonedDateStart?: string;

  abandonedDateEnd?: string;

  taskIds?: string[];

  idList?: string[];

  importListVo(filterVo: TodoListFiltersVo) {
    importListVo(filterVo, this);
  }
}

export class TodoPageFiltersDto extends IntersectionType(
  PageFilterDto,
  TodoListFilterDto
) {
  importPageVo(filterVo: TodoPageFiltersVo) {
    importListVo(filterVo, this);
    this.pageNum = filterVo.pageNum;
    this.pageSize = filterVo.pageSize;
  }
}

function importListVo(
  filterVo: TodoListFiltersVo,
  filterDto: TodoListFilterDto
) {
  filterDto.importance = filterVo.importance;
  filterDto.urgency = filterVo.urgency;
  filterDto.status = filterVo.status;
  filterDto.planDateStart = filterVo.planDateStart;
  filterDto.planDateEnd = filterVo.planDateEnd;
  filterDto.doneDateStart = filterVo.doneDateStart;
  filterDto.doneDateEnd = filterVo.doneDateEnd;
  filterDto.abandonedDateStart = filterVo.abandonedDateStart;
  filterDto.abandonedDateEnd = filterVo.abandonedDateEnd;
  filterDto.idList = filterVo.idList;
}
