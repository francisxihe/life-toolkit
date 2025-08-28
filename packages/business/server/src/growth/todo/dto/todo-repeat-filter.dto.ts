import { PageFilterDto } from "../../../common/filter";
import { TodoRepeatDto } from "./todo-repeat-model.dto";
import {
  PickType,
  IntersectionType,
  PartialType,
} from "@life-toolkit/mapped-types";
// import { TodoRepeatListFiltersVo, TodoRepeatPageFiltersVo } from "@life-toolkit/vo";

export class TodoRepeatListFilterDto extends PartialType(
  PickType(TodoRepeatDto, ["importance", "urgency", "status"] as const)
) {
  keyword?: string;

  currentDateStart?: string;

  currentDateEnd?: string;

  abandonedDateStart?: string;

  abandonedDateEnd?: string;

  importListVo(filterVo: any) {
    importListVo(filterVo, this);
  }
}

export class TodoRepeatPageFiltersDto extends IntersectionType(
  PageFilterDto,
  TodoRepeatListFilterDto
) {
  importPageVo(filterVo: any) {
    importListVo(filterVo, this);
    this.pageNum = filterVo.pageNum;
    this.pageSize = filterVo.pageSize;
  }
}

function importListVo(
  filterVo: any,
  filterDto: TodoRepeatListFilterDto
) {
  filterDto.importance = filterVo.importance;
  filterDto.urgency = filterVo.urgency;
  filterDto.status = filterVo.status;
  filterDto.keyword = filterVo.keyword;
  filterDto.currentDateStart = filterVo.currentDateStart;
  filterDto.currentDateEnd = filterVo.currentDateEnd;
  filterDto.abandonedDateStart = filterVo.abandonedDateStart;
  filterDto.abandonedDateEnd = filterVo.abandonedDateEnd;
}
