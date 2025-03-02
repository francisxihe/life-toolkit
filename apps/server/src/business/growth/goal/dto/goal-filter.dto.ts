import { IsOptional, IsString, IsDateString } from "class-validator";
import { PageDto } from "@/base/page.dto";
import { GoalDto } from "./goal.dto";
import { PickType, IntersectionType, PartialType } from "@nestjs/mapped-types";

export class GoalPageFilterDto extends IntersectionType(
  PageDto,
  PartialType(
    PickType(GoalDto, ["importance", "urgency", "status", "type"] as const)
  )
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

/** aaaa */
sda?: string;
}

export class GoalListFilterDto extends PartialType(
  PickType(GoalDto, ["importance", "urgency", "status", "type"] as const)
) {
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

/** aaaa */
sda?: string;
}
