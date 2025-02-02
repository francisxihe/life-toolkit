import { ApiProperty } from "@nestjs/swagger";
import { TodoVO } from "./todo.vo";

export class TodoPageVO {
  @ApiProperty({
    description: "待办事项列表",
    type: [TodoVO],
  })
  list: TodoVO[];

  @ApiProperty({ description: "总数" })
  total: number;

  @ApiProperty({ description: "当前页码" })
  pageNum: number;

  @ApiProperty({ description: "每页数量" })
  pageSize: number;
} 