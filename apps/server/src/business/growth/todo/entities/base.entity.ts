import { Column } from "typeorm";
import { BaseEntity } from "@/base/base.entity";
import { TodoStatus } from "./enum";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsISO8601,
} from "class-validator";
import { Type } from "class-transformer";

export class BaseTodoEntity extends BaseEntity {
  /** 待办名称 */
  @Column()
  @IsString()
  name: string;

  /** 待办事项状态 */
  @Column({
    type: "enum",
    enum: TodoStatus,
    nullable: true,
  })
  @IsEnum(TodoStatus)
  status: TodoStatus;

  /** 待办描述 */
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  /** 待办重要程度 */
  @Column({ nullable: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  importance?: number;

  /** 待办紧急程度 */
  @Column({ nullable: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  urgency?: number;

  /** 待办标签 */
  @Column("simple-array")
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  /** 待办完成时间 */
  @Column("datetime", {
    nullable: true,
  })
  doneAt?: Date;

  /** 放弃待办时间 */
  @Column("datetime", {
    nullable: true,
  })
  abandonedAt?: Date;

  /** 计划待办开始时间 */
  @Column("time", { nullable: true })
  planStartAt?: string;

  /** 计划待办结束时间 */
  @Column("time", { nullable: true })
  planEndAt?: string;
}
