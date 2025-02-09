import { TodoStatus } from "../../entities/base.entity";
import { TodoRepeat } from "../../entities/todo.entity";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsISO8601,
} from "class-validator";

export class CreateTodoDto {
  /** 待办事项名称 */
  @IsString()
  name: string;

  /** 待办事项描述 */
  @IsString()
  @IsOptional()
  description?: string;

  /** 待办事项状态 */
  @IsEnum(TodoStatus)
  @IsOptional()
  status?: TodoStatus;

  /** 标签列表 */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  /** 重要程度 1-5 */
  @IsNumber()
  @IsOptional()
  importance?: number;

  /** 紧急程度 1-5 */
  @IsNumber()
  @IsOptional()
  urgency?: number;

  /** 计划日期 */
  @IsISO8601()
  planDate: string;

  /** 重复 */
  @IsEnum(TodoRepeat)
  @IsOptional()
  repeat?: TodoRepeat;
}
