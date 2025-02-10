import { IsString } from "class-validator";
import { SubTodoDto } from "./sub-todo-model.dto";

export class SubTodoWithSubDto extends SubTodoDto {
  subTodoList: SubTodoDto[];
}

export class SubTodoListFilterDto {
  /** 父待办id */
  @IsString()
  parentId: string;
}
