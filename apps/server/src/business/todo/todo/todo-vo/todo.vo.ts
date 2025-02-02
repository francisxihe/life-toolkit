import { ApiProperty } from "@nestjs/swagger";
import { TodoStatus, TodoStatusMeta } from "../../entities/base.entity";
import { TodoRepeat, TodoRepeatMeta } from "../../entities/todo.entity";

export class TodoVO {
  @ApiProperty({ description: "待办事项ID" })
  id: string;

  @ApiProperty({ 
    description: "待办事项名称",
    required: true 
  })
  name: string;

  @ApiProperty({ description: "待办事项描述" })
  description: string | null;

  @ApiProperty(TodoStatusMeta)
  status: TodoStatus;

  @ApiProperty({
    description: "标签列表",
    type: [String],
  })
  tags: string[] | null;

  @ApiProperty({
    description: "重要程度 1-5",
    minimum: 1,
    maximum: 5,
  })
  importance: number | null;

  @ApiProperty({
    description: "紧急程度 1-5",
    minimum: 1,
    maximum: 5,
  })
  urgency: number | null;

  @ApiProperty({
    description: "计划日期",
    example: "2024-01-01",
    required: true
  })
  planDate: string;

  @ApiProperty({
    description: "计划时间范围",
    type: [String],
    example: ["09:00", "10:00"],
  })
  planTimeRange: [string, string] | null;

  @ApiProperty(TodoRepeatMeta)
  repeat: TodoRepeat;

  @ApiProperty({ description: "创建时间" })
  createdAt: Date;

  @ApiProperty({ description: "更新时间" })
  updatedAt: Date;

  @ApiProperty({ description: "完成时间" })
  doneAt: Date | null;

  @ApiProperty({ description: "放弃时间" })
  abandonedAt: Date | null;
} 