import { SubTodo } from "../../entities/sub-todo.entity";
import { IsString, IsOptional, IsEnum, IsArray, IsNumber } from "class-validator";
import { TodoStatus } from "../../entities/base.entity";

export class CreateSubTodoDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TodoStatus)
  @IsOptional()
  status?: TodoStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsNumber()
  @IsOptional()
  importance?: number;

  @IsNumber()
  @IsOptional()
  urgency?: number;

  @IsString()
  planDate: string;

  @IsString()
  parentId: string;
}
