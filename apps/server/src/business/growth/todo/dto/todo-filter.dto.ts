import { IsOptional, IsString, IsDateString } from "class-validator";
import { PageDto } from "@/base/page.dto";
import { TodoDto } from "./todo-model.dto";
import { PickType, IntersectionType, PartialType } from "@nestjs/mapped-types";

export class TodoListFilterDto extends PartialType(
  PickType(TodoDto, ["importance", "urgency", "status"] as const)
) {
  /** 搜索关键词 */
  @IsOptional()
  @IsString()
  keyword?: string;

  /** 计划开始日期 */
  @IsOptional()
  @IsDateString()
  planDateStart?: string;

  /** 计划结束日期 */
  @IsOptional()
  @IsDateString()
  planDateEnd?: string;

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

  /** 任务ID */
  @IsOptional()
  @IsString()
  taskId?: string;
}

export class TodoPageFilterDto extends IntersectionType(
  PageDto,
  TodoListFilterDto
) {}
