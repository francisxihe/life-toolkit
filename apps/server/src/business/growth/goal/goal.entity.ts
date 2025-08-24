import {
  Entity,
  Column,
  TreeChildren,
  TreeParent,
  Tree,
  OneToMany,
} from "typeorm";
import { BaseEntity } from "@/base/base.entity";
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsISO8601,
} from "class-validator";
import { Type } from "class-transformer";
import { GoalType, GoalStatus } from "@life-toolkit/enum";
import { Task } from "../task";

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
  @IsOptional()
  type?: GoalType;

  /** 目标事项状态 */
  @Column({
    type: "enum",
    enum: GoalStatus,
    default: GoalStatus.TODO,
  })
  @IsEnum(GoalStatus)
  status: GoalStatus;

  /** 目标开始时间 */
  @Column("datetime", {
    nullable: true,
  })
  @IsISO8601()
  @IsOptional()
  startAt?: Date;

  /** 目标结束时间 */
  @Column("datetime", {
    nullable: true,
  })
  @IsISO8601()
  @IsOptional()
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

  /** 目标完成时间 */
  @Column("datetime", {
    nullable: true,
  })
  @IsISO8601()
  @IsOptional()
  doneAt?: Date;

  /** 放弃目标时间 */
  @Column("datetime", {
    nullable: true,
  })
  @IsISO8601()
  @IsOptional()
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
  children: Goal[];

  /** 目标优先级 */
  @Column({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  priority?: number;

  /** 任务 */
  @OneToMany(() => Task, (task) => task.goal)
  taskList: Task[];
}
