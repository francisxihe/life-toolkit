import { IsOptional, IsString, IsDateString } from "class-validator";
import { PageDto } from "@/base/page.dto";
import { TaskDto } from "./task-model.dto";
import { PickType, IntersectionType, PartialType } from "@nestjs/mapped-types";

export class TaskListFilterDto extends PartialType(
  PickType(TaskDto, ["importance", "urgency", "status", "startAt", "endAt"] as const)
) {
  /** 搜索关键词 */
  keyword?: string;

  /** 完成开始日期 */
  doneDateStart?: string;

  /** 完成结束日期 */
  doneDateEnd?: string;

  /** 放弃开始日期 */
  abandonedDateStart?: string;

  /** 放弃结束日期 */
  abandonedDateEnd?: string;

  /** 不包含自身 */
  withoutSelf?: boolean;

  /** 任务ID */
  id?: string;
}

export class TaskPageFilterDto extends IntersectionType(
  PageDto,
  TaskListFilterDto
) {}
