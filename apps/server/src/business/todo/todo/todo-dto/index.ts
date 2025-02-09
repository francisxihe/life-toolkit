export * from "./create-todo.dto";
export * from "./update-todo.dto";
export * from "./todo-page-filter.dto";
export * from "./todo-list-filter.dto";
export * from "./todo.dto";
import { TodoDto } from "./todo.dto";
import { SubTodoDto } from "../../sub-todo/sub-todo-dto";

export class TodoWithSubDto extends TodoDto {
  subTodoList: SubTodoDto[];
}
