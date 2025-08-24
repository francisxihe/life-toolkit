import "reflect-metadata";
import { Entity, Column, TreeChildren, TreeParent, Tree, OneToMany } from "typeorm";
import { BaseEntity } from "../../base.entity";
import { Task } from "../task/task.entity";


export enum GoalStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  DONE = "done",
  ABANDONED = "abandoned",
}

export enum GoalType {
  OBJECTIVE = "objective",
  KEY_RESULT = "key_result",
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
    nullable: true
  })
  type?: GoalType;

  /** 目标事项状态 */
  @Column({
    type: 'simple-enum',
    enum: GoalStatus,
    default: GoalStatus.TODO
  })
  status: GoalStatus;

  /** 目标重要程度 */
  @Column('int', { nullable: true })
  importance?: number;

  /** 紧急程度 */
  @Column('int', { nullable: true })
  urgency?: number;

  /** 标签 */
  @Column('simple-array', { nullable: true })
  tags?: string[];

  /** 目标开始时间 */
  @Column('datetime', { nullable: true })
  startAt?: Date;

  /** 目标结束时间 */
  @Column('datetime', { nullable: true })
  endAt?: Date;

  /** 目标完成时间 */
  @Column('datetime', { nullable: true })
  doneAt?: Date;

  /** 放弃目标时间 */
  @Column('datetime', { nullable: true })
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
  @Column('int', { nullable: true })
  priority?: number;

  /** 任务 */
  @OneToMany(() => Task, (task) => task.goal)
  taskList: Task[];
}