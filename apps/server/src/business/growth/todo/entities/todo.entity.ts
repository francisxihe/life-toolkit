import { Entity, Column, OneToMany, ManyToOne, OneToOne, JoinColumn } from "typeorm";
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
import { TodoRepeat } from "./todo-repeat.entity";

export enum TodoSource {
  /** 手动创建 */
  MANUAL = "manual",
  /** 重复创建 */
  REPEAT = "repeat",
}

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

  /** 关联的任务 */
  @ManyToOne(() => Task, (task) => task.todoList)
  task?: Task;

  /** 任务ID */
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  taskId?: string;

  /** 重复配置 */
  @ManyToOne(() => TodoRepeat, (repeat) => repeat.todos, { nullable: true })
  @JoinColumn({ name: "repeat_id" })
  repeat?: TodoRepeat;

  /** 重复配置ID */
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  repeatId?: string;

  /** 原始重复配置ID（用于保留关联记录） */
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  originalRepeatId?: string;

  /** 来源 */
  @Column({ nullable: true, type: "enum", enum: TodoSource })
  @IsOptional()
  source?: TodoSource;
}
