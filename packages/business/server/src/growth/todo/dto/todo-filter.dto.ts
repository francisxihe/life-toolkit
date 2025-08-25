import { PageDto } from "../../../base/page.dto";
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

  importListVo(filterVo: TodoListFiltersVo) {
    this.importance = filterVo.importance;
    this.urgency = filterVo.urgency;
    this.status = filterVo.status;
    this.planDateStart = filterVo.planDateStart;
    this.planDateEnd = filterVo.planDateEnd;
    this.doneDateStart = filterVo.doneDateStart;
    this.doneDateEnd = filterVo.doneDateEnd;
    this.abandonedDateStart = filterVo.abandonedDateStart;
    this.abandonedDateEnd = filterVo.abandonedDateEnd;
  }
}

export class TodoPageFilterDto extends IntersectionType(
  PageDto,
  TodoListFilterDto
) {
  importPageVo(filterVo: TodoPageFiltersVo) {
    this.importListVo(filterVo);
    this.pageNum = filterVo.pageNum;
    this.pageSize = filterVo.pageSize;
  }
}
