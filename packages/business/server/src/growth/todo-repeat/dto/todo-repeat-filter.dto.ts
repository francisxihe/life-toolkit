import { PageFilterDto } from "../../../common/filter";
import { TodoRepeatDto } from "./todo-repeat-model.dto";
import {
  PickType,
  IntersectionType,
  PartialType,
} from "@life-toolkit/mapped-types";
// import { TodoRepeatListFiltersVo, TodoRepeatPageFiltersVo } from "@life-toolkit/vo";

export class TodoRepeatListFilterDto extends PartialType(
  PickType(TodoRepeatDto, ["importance", "urgency", "status", "source"] as const)
) {
  keyword?: string;

  startDateStart?: string;

  startDateEnd?: string;

  endDateStart?: string;

  endDateEnd?: string;

  doneDateStart?: string;

  doneDateEnd?: string;

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
  filterDto.source = filterVo.source;
  filterDto.keyword = filterVo.keyword;
  filterDto.startDateStart = filterVo.startDateStart;
  filterDto.startDateEnd = filterVo.startDateEnd;
  filterDto.endDateStart = filterVo.endDateStart;
  filterDto.endDateEnd = filterVo.endDateEnd;
  filterDto.doneDateStart = filterVo.doneDateStart;
  filterDto.doneDateEnd = filterVo.doneDateEnd;
  filterDto.abandonedDateStart = filterVo.abandonedDateStart;
  filterDto.abandonedDateEnd = filterVo.abandonedDateEnd;
}
