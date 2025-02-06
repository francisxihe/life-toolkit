import { ApiProperty } from "@nestjs/swagger";
import { TodoStatus, TodoStatusMeta } from "../../entities/base.entity";

export class CreateSubTodoVO {
  @ApiProperty({ 
    description: "子待办事项名称",
    required: true 
  })
  name: string;

  @ApiProperty({ 
    description: "子待办事项描述",
    required: false 
  })
  description?: string;

  @ApiProperty({
    ...TodoStatusMeta,
    required: false
  })
  status?: TodoStatus;

  @ApiProperty({
    description: "标签列表",
    type: [String],
    required: false
  })
  tags?: string[];

  @ApiProperty({
    description: "重要程度 1-5",
    minimum: 1,
    maximum: 5,
    required: false
  })
  importance?: number;

  @ApiProperty({
    description: "紧急程度 1-5",
    minimum: 1,
    maximum: 5,
    required: false
  })
  urgency?: number;

  @ApiProperty({
    description: "计划日期",
    example: "2024-01-01",
    required: true
  })
  planDate: string;

  @ApiProperty({ 
    description: "父待办事项ID",
    required: true
  })
  parentId: string;
} 