import { Entity, Column, TreeChildren, TreeParent, Tree } from "typeorm";
import { BaseEntity } from "@/base/base.entity";
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
} from "class-validator";
import { Type } from "class-transformer";
import { GoalStatus, GoalType } from "./enum";

@Entity("goal")
@Tree("closure-table")
export class Goal extends BaseEntity {
  /** 目标名称 */
  @Column()
  @IsString()
  name: string;

  /** 目标类型 */
  @Column({
    type: "enum",
    enum: GoalType,
    nullable: true,
  })
  @IsEnum(GoalType)
  type: GoalType;

  /** 目标事项状态 */
  @Column({
    type: "enum",
    enum: GoalStatus,
    nullable: true,
  })
  @IsEnum(GoalStatus)
  status: GoalStatus;

  /** 目标开始时间 */
  @Column("datetime", {
    nullable: true,
  })
  @IsString()
  startAt?: Date;

  /** 目标结束时间 */
  @Column("datetime", {
    nullable: true,
  })
  @IsString()
  endAt?: Date;

  /** 目标描述 */
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  /** 目标重要程度 */
  @Column({ nullable: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  importance?: number;

  /** 目标紧急程度 */
  @Column({ nullable: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  urgency?: number;

  /** 目标完成时间 */
  @Column("datetime", {
    nullable: true,
  })
  doneAt?: Date;

  /** 放弃目标时间 */
  @Column("datetime", {
    nullable: true,
  })
  abandonedAt?: Date;

  /** 父目标 */
  @TreeParent({
    onDelete: "CASCADE",
  })
  parent?: Goal;

  /** 子目标 */
  @TreeChildren({
    cascade: true,
  })
  children?: Goal[];
}
