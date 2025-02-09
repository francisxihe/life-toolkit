import { TodoStatus } from "../../entities/base.entity";
import {
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  IsEnum,
} from "class-validator";

export class TodoListFilterDto {
  /** 计划开始日期 */
  @IsOptional()
  @IsDateString()
  planDateStart?: string;

  /** 计划结束日期 */
  @IsOptional()
  @IsDateString()
  planDateEnd?: string;

  /** 重要程度 */
  @IsOptional()
  @IsNumber()
  importance?: number;

  /** 紧急程度 */
  @IsOptional()
  @IsNumber()
  urgency?: number;

  /** 待办事项状态 */
  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus;

  /** 完成开始日期 */
  @IsOptional()
  @IsDateString()
  doneDateStart?: string;

  /** 完成结束日期 */
  @IsOptional()
  @IsDateString()
  doneDateEnd?: string;

  /** 放弃开始日期 */
  @IsOptional()
  @IsDateString()
  abandonedDateStart?: string;

  /** 放弃结束日期 */
  @IsOptional()
  @IsDateString()
  abandonedDateEnd?: string;
}
