import { IsOptional, IsString, IsDateString } from "class-validator";
import { PageDto } from "@/base/page.dto";
import { TaskDto } from "./task-model.dto";
import { PickType, IntersectionType, PartialType } from "@nestjs/mapped-types";

export class TaskPageFilterDto extends IntersectionType(
  PageDto,
  PartialType(PickType(TaskDto, ["importance", "urgency", "status"] as const))
) {
  /** 搜索关键词 */
  keyword?: string;

  /** 计划开始日期 */
  planDateStart?: string;

  /** 计划结束日期 */
  planDateEnd?: string;

  /** 完成开始日期 */
  doneDateStart?: string;

  /** 完成结束日期 */
  doneDateEnd?: string;

  /** 放弃开始日期 */
  abandonedDateStart?: string;

  /** 放弃结束日期 */
  abandonedDateEnd?: string;
}

export class TaskListFilterDto extends PartialType(
  PickType(TaskDto, ["importance", "urgency", "status"] as const)
) {
  /** 计划开始日期 */
  planDateStart?: string;

  /** 计划结束日期 */
  planDateEnd?: string;

  /** 完成开始日期 */
  doneDateStart?: string;

  /** 完成结束日期 */
  doneDateEnd?: string;

  /** 放弃开始日期 */
  abandonedDateStart?: string;

  /** 放弃结束日期 */
  abandonedDateEnd?: string;
}
