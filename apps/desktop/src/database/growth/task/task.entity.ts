import "reflect-metadata";
import {
  Entity,
  Column,
  TreeChildren,
  TreeParent,
  Tree,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { BaseEntity } from "../../base.entity";
import { Goal } from "../goal/goal.entity";
import { Todo } from "../todo/todo.entity";
import { TaskStatus } from "@life-toolkit/enum";

@Entity("task")
@Tree("closure-table")
export class Task extends BaseEntity {
  /** 任务名称 */
  @Column('varchar', { length: 255 })
  name: string;

  /** 任务描述 */
  @Column('text', { nullable: true })
  description?: string;

  /** 任务事项状态 */
  @Column({
    type: 'simple-enum',
    enum: TaskStatus,
    nullable: true
  })
  status: TaskStatus;

  /** 任务预估时间 */
  @Column('varchar', { nullable: true })
  estimateTime?: string;

  /** 任务跟踪时间ID列表 */
  @Column('simple-array', { nullable: true })
  trackTimeIds: string[];

  /** 任务重要程度 */
  @Column('int', { nullable: true })
  importance?: number;

  /** 任务紧急程度 */
  @Column('int', { nullable: true })
  urgency?: number;

  /** 任务标签 */
  @Column('simple-array', { nullable: true })
  tags: string[];

  /** 任务完成时间 */
  @Column('datetime', { nullable: true })
  doneAt?: Date;

  /** 放弃任务时间 */
  @Column('datetime', { nullable: true })
  abandonedAt?: Date;

  /** 计划任务开始时间 */
  @Column('datetime', { nullable: true })
  startAt?: Date;

  /** 计划任务结束时间 */
  @Column('datetime', { nullable: true })
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
  children: Task[];

  /** 任务事项列表 */
  @OneToMany(() => Todo, (todo) => todo.task)
  todoList?: Todo[];

  /** 目标 */
  @ManyToOne(() => Goal, (goal) => goal.taskList)
  goal?: Goal;

  /** 目标ID */
  @Column('varchar', { nullable: true })
  goalId?: string;
}