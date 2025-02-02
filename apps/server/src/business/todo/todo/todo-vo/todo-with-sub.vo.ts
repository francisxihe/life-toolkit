import { ApiProperty } from "@nestjs/swagger";
import { TodoVO } from "./todo.vo";

export class TodoWithSubVO extends TodoVO {
  @ApiProperty({
    description: "子待办事项列表",
    type: [TodoVO],
  })
  subTodoList: TodoVO[];
} 