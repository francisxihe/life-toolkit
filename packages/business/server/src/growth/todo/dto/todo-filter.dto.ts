import { PageDto } from "../../../base/page.dto";
import { TodoDto } from "./todo-model.dto";
import { PickType, IntersectionType, PartialType } from "../../../common/mapped-types";

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
}

export class TodoPageFilterDto extends IntersectionType(
  PageDto,
  TodoListFilterDto
) {}
