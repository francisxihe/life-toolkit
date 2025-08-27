import { Entity, OneToMany, Column } from "typeorm";
import { Todo } from "../todo/todo.entity";
import { Repeat } from "@life-toolkit/components-repeat/server";
import { TodoStatus, TodoSource } from "@life-toolkit/enum";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

@Entity("todo_repeat")
export class TodoRepeat extends Repeat {
  /** 模板名称 */
  @Column("varchar", { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

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

  /** 来源 */
  @Column({ type: "varchar", length: 20, nullable: true })
  @IsOptional()
  source?: TodoSource;

  /** 开始时间（日期时间） */
  @Column("datetime", { nullable: true })
  startAt?: Date;

  /** 结束时间（日期时间） */
  @Column("datetime", { nullable: true })
  endAt?: Date;

  /** 状态（模板整体状态） */
  @Column({ type: "varchar", length: 20, nullable: true })
  @IsEnum(TodoStatus)
  @IsOptional()
  status?: TodoStatus;

  /** 完成时间 */
  @Column("datetime", { nullable: true })
  doneAt?: Date;

  /** 放弃时间 */
  @Column("datetime", { nullable: true })
  abandonedAt?: Date;

  /** 关联的待办列表 */
  @OneToMany(() => Todo, (todo) => todo.repeat, { nullable: true })
  todos?: Todo[];
}
