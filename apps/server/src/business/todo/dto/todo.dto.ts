import { TodoDto } from "./todo-model.dto";
import { SubTodoDto } from ".";
import { PartialType } from "@nestjs/swagger";
import { CreateTodoDto } from "./todo-model.dto";

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  /** 待办事项ID */
  id: string;
}

export class TodoWithSubDto extends TodoDto {
  subTodoList: SubTodoDto[];
}
