import { Entity, OneToMany, Column } from "typeorm";
import { Todo } from "../todo/todo.entity";
import {
  RepeatMode,
  RepeatConfig,
  RepeatEndMode,
} from "@life-toolkit/components-repeat";
import { TodoStatus } from "@life-toolkit/enum";
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";
import { BaseEntity } from "@business/common";

export class TodoRepeatModel extends BaseEntity {
  /** 重复模式 */
  @Column({
    type: "varchar",
    length: 20,
  })
  repeatMode!: RepeatMode;

  /** 重复配置 */
  @Column({ type: "text", nullable: true })
  repeatConfig?: RepeatConfig;

  /** 重复结束模式 */
  @Column({
    type: "varchar",
    length: 20,
  })
  repeatEndMode!: RepeatEndMode;

  /** 重复结束日期 */
  @Column({
    type: "date",
    nullable: true,
  })
  repeatEndDate?: string;

  /** 重复次数 */
  @Column({
    type: "int",
    nullable: true,
  })
  repeatTimes?: number;

  /** 已创建的重复次数 */
  @Column({
    type: "int",
    nullable: true,
  })
  repeatedTimes?: number;

  /** 模板名称 */
  @Column("varchar", { nullable: true })
  @IsString()
  @IsOptional()
  name!: string;

  /** 模板描述 */
  @Column("text", { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  /** 模板重要程度 */
  @Column("int", { nullable: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  importance?: number;

  /** 模板紧急程度 */
  @Column("int", { nullable: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  urgency?: number;

  /** 模板标签 */
  @Column("simple-array", { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  /** 重复开始日期 */
  @Column("date", { nullable: true })
  repeatStartDate!: string;

  /** 当前执行到的重复日期 */
  @Column("date", { nullable: true })
  currentDate!: string;

  /** 状态（模板整体状态） */
  @Column({ type: "varchar", length: 20, nullable: true })
  @IsEnum(TodoStatus)
  @IsOptional()
  status!: TodoStatus;

  /** 放弃时间 */
  @Column("datetime", { nullable: true })
  abandonedAt?: Date;
}

@Entity("todo_repeat")
export class TodoRepeat extends TodoRepeatModel {
  /** 关联的待办列表 */
  @OneToMany(() => Todo, (todo) => todo.repeat, { nullable: true })
  todos?: Todo[];
}
