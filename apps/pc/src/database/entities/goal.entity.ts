import "reflect-metadata";
import { Entity, Column, TreeChildren, TreeParent, Tree, OneToMany } from "typeorm";
import { BaseEntity } from "../base.entity";
import { Task } from "./task.entity";

export enum GoalStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  DONE = "done",
  ABANDONED = "abandoned",
}

export enum GoalType {
  PERSONAL = "personal",
  WORK = "work",
  HEALTH = "health",
  LEARNING = "learning",
  FINANCIAL = "financial",
  OTHER = "other",
}

@Entity("goal")
@Tree("closure-table")
export class Goal extends BaseEntity {
  /** 目标名称 */
  @Column('varchar', { length: 255 })
  name: string;

  /** 目标描述 */
  @Column('text', { nullable: true })
  description?: string;

  /** 目标类型 */
  @Column({
    type: 'simple-enum',
    enum: GoalType,
    default: GoalType.PERSONAL
  })
  type: GoalType;

  /** 目标事项状态 */
  @Column({
    type: 'simple-enum',
    enum: GoalStatus,
    default: GoalStatus.TODO
  })
  status: GoalStatus;

  /** 目标重要程度 */
  @Column('int', { default: 1 })
  importance: number;

  /** 紧急程度 */
  @Column('int', { default: 1 })
  urgency: number;

  /** 标签 */
  @Column('simple-array', { nullable: true })
  tags?: string[];

  /** 目标开始时间 */
  @Column('datetime', { nullable: true })
  startDate?: Date;

  /** 目标结束时间 */
  @Column('datetime', { nullable: true })
  targetDate?: Date;

  /** 目标完成时间 */
  @Column('datetime', { nullable: true })
  completedAt?: Date;

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
  @Column('int', { nullable: true })
  priority?: number;

  /** 任务 */
  @OneToMany(() => Task, (task) => task.goal)
  taskList: Task[];
}