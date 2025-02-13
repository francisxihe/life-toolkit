import { PickType } from "@nestjs/mapped-types";
import { SubTodoDto } from "./sub-todo.dto";

export class SubTodoListFilterDto extends PickType(SubTodoDto, [
  "parentId",
] as const) {}
