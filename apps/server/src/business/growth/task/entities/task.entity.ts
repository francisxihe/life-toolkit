import { Entity, Column, TreeChildren, TreeParent, Tree, ManyToOne } from "typeorm";
import { BaseEntity } from "@/base/base.entity";
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
} from "class-validator";
import { Type } from "class-transformer";
import { TaskStatus } from "./enum";
import { Goal } from "../../goal/entities/goal.entity";

@Entity("task")
@Tree("closure-table")
export class Task extends BaseEntity {
  /** 任务名称 */
  @Column()
  @IsString()
  name: string;

  /** 任务事项状态 */
  @Column({
    type: "enum",
    enum: TaskStatus,
    nullable: true,
  })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  /** 任务预估时间 */
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  estimateTime?: string;

  /** 任务跟踪时间ID列表 */
  @Column("simple-array", {
    nullable: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  trackTimeIds: string[];

  /** 任务描述 */
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  /** 任务重要程度 */
  @Column({ nullable: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  importance?: number;

  /** 任务紧急程度 */
  @Column({ nullable: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  urgency?: number;

  /** 任务标签 */
  @Column("simple-array")
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  /** 任务完成时间 */
  @Column("datetime", {
    nullable: true,
  })
  doneAt?: Date;

  /** 放弃任务时间 */
  @Column("datetime", {
    nullable: true,
  })
  abandonedAt?: Date;

  /** 计划任务开始时间 */
  @Column("datetime", { nullable: true })
  startAt?: Date;

  /** 计划任务结束时间 */
  @Column("datetime", { nullable: true })
  endAt?: Date;

  /** 父任务 */
  @TreeParent({
    onDelete: "CASCADE",
  })
  parent?: Task;

  /** 子任务 */
  @TreeChildren({
    cascade: true,
  })
  children?: Task[];

  /** 目标 */
  @ManyToOne(() => Goal, (goal) => goal.taskList)
  goal: Goal;
}
