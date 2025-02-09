import { TodoStatus } from "../../entities/base.entity";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsISO8601,
} from "class-validator";
import { BaseModelDto } from "@/base/base-model.dto";

export class SubTodoDto extends BaseModelDto {
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

  /** 计划开始时间 */
  planStartAt?: string;

  /** 计划结束时间 */
  planEndAt?: string;

  /** 待办完成时间 */
  doneAt?: Date;

  /** 放弃待办时间 */
  abandonedAt?: Date;

  /** 父级待办事项ID */
  parentId: string;
}
