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
import { BaseEntity } from "../base.entity";
import { Goal } from "./goal.entity";
import { Todo } from "./todo.entity";

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  DONE = "done",
  ABANDONED = "abandoned",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

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
    default: TaskStatus.TODO
  })
  status: TaskStatus;

  /** 任务标签 */
  @Column('simple-array', { nullable: true })
  tags?: string[];

  /** 任务完成时间 */
  @Column('datetime', { nullable: true })
  completedAt?: Date;

  /** 任务优先级 */
  @Column({
    type: 'simple-enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM
  })
  priority: TaskPriority;

  /** 任务截止时间 */
  @Column('datetime', { nullable: true })
  dueDate?: Date;

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