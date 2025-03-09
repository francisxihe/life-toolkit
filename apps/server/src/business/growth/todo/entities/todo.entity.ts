import { Entity, Column, OneToMany, ManyToOne } from "typeorm";
import { TodoRepeat } from "./enum";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsISO8601,
} from "class-validator";
import { Type } from "class-transformer";
import { BaseEntity } from "@/base/base.entity";
import { TodoStatus } from "./enum";
import { Task } from "../../task/entities";

@Entity("todo")
export class Todo extends BaseEntity {
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

  /** 计划待办日期 */
  @Column("date")
  @IsISO8601()
  planDate: Date = new Date();

  /** 重复类型 */
  @Column({
    type: "enum",
    enum: TodoRepeat,
    nullable: true,
  })
  @IsEnum(TodoRepeat)
  @IsOptional()
  repeat?: TodoRepeat;

  /** 待办重复间隔 */
  @Column({ nullable: true })
  @IsOptional()
  repeatInterval?: string;

  /** 关联的任务 */
  @ManyToOne(() => Task, (task) => task.todoList)
  task?: Task;
}
