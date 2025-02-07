import { TodoStatus, TodoStatusMeta } from "../../entities/base.entity";
import { TodoRepeat, TodoRepeatMeta } from "../../entities/todo.entity";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsISO8601,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { BaseModelEntity } from "@/base/base-model.dto";

export class TodoDto extends BaseModelEntity {
  /** "待办事项名称" */
  @IsString()
  name: string;

  @ApiProperty({ description: "待办事项描述", required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ ...TodoStatusMeta, required: false })
  @IsEnum(TodoStatus)
  @IsOptional()
  status?: TodoStatus;

  @ApiProperty({
    description: "标签列表",
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: "重要程度 1-5",
    minimum: 1,
    maximum: 5,
    required: false,
    default: 3,
  })
  @IsNumber()
  @IsOptional()
  importance?: number;

  @ApiProperty({
    description: "紧急程度 1-5",
    minimum: 1,
    maximum: 5,
    required: false,
    default: 3,
  })
  @IsNumber()
  @IsOptional()
  urgency?: number;

  @ApiProperty({
    description: "计划日期，ISO8601格式",
    example: "2024-01-01",
  })
  @IsISO8601()
  planDate: string;

  @ApiProperty({
    description: "计划时间范围",
    type: [String],
    example: ["09:00", "10:00"],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  planTimeRange?: [string, string];

  @ApiProperty({ ...TodoRepeatMeta, required: false })
  @IsEnum(TodoRepeat)
  @IsOptional()
  repeat?: TodoRepeat;


  /** 待办完成时间 */
  doneAt: Date | null;

  /** 放弃待办时间 */
  abandonedAt: Date | null;
}
