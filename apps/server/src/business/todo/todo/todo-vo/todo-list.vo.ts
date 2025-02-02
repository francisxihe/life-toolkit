import { ApiProperty } from "@nestjs/swagger";
import { TodoVO } from "./todo.vo";

export class TodoListVO {
  @ApiProperty({
    description: "待办事项列表",
    type: [TodoVO],
  })
  list: TodoVO[];
}
