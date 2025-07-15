import { IsOptional, IsString } from "class-validator";
import { PageDto } from "@/base/page.dto";
import { GoalDto } from "./goal-model.dto";
import { PickType, IntersectionType, PartialType } from "@nestjs/mapped-types";

// 列表过滤DTO - 选择可过滤的字段
export class GoalListFilterDto extends PartialType(
  PickType(GoalDto, ["type", "importance"] as const)
) {
  status?: GoalDto["status"];

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
  
  /** 排除自身 */
  withoutSelf?: boolean;

  /** 目标ID */
  id?: string;

  /** 父目标ID */
  parentId?: string;

  /** 开始时间过滤 */
  startAt?: Date;

  /** 结束时间过滤 */
  endAt?: Date;
}

// 分页过滤DTO - 继承列表过滤 + 分页
export class GoalPageFilterDto extends IntersectionType(
  PageDto,
  GoalListFilterDto
) {}
