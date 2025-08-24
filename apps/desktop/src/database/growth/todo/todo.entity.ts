import "reflect-metadata";
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../base.entity";
import { Task } from "../task/task.entity";
import { Habit } from "../habit/habit.entity";

export enum TodoStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  DONE = "done",
  ABANDONED = "abandoned",
}

export enum TodoSource {
  /** 手动创建 */
  MANUAL = "manual",
  /** 重复创建 */
  REPEAT = "repeat",
  /** 习惯创建 */
  HABIT = "habit",
}

@Entity("todo")
export class Todo extends BaseEntity {
  /** 待办名称 */
  @Column('varchar', { length: 255 })
  name: string;

  /** 待办事项状态 */
  @Column({
    type: 'simple-enum',
    enum: TodoStatus,
    default: TodoStatus.TODO
  })
  status: TodoStatus;

  /** 待办描述 */
  @Column('text', { nullable: true })
  description?: string;

  /** 待办重要程度 */
  @Column('int', { nullable: true })
  importance?: number;

  /** 待办紧急程度 */
  @Column('int', { nullable: true })
  urgency?: number;

  /** 待办标签 */
  @Column('simple-array', { nullable: true })
  tags?: string[];

  /** 待办完成时间 */
  @Column('datetime', { nullable: true })
  doneAt?: Date;

  /** 放弃待办时间 */
  @Column('datetime', { nullable: true })
  abandonedAt?: Date;

  /** 计划待办开始时间 */
  @Column('time', { nullable: true })
  planStartAt?: string;

  /** 计划待办结束时间 */
  @Column('time', { nullable: true })
  planEndAt?: string;

  /** 计划待办日期 */
  @Column('date')
  planDate: Date = new Date();

  /** 关联的任务 */
  @ManyToOne(() => Task, (task) => task.todoList)
  task?: Task;

  /** 任务ID */
  @Column('varchar', { nullable: true })
  taskId?: string;

  /** 重复配置ID */
  @Column('varchar', { nullable: true })
  repeatId?: string;

  /** 原始重复配置ID（用于保留关联记录） */
  @Column('varchar', { nullable: true })
  originalRepeatId?: string;

  /** 关联的习惯 */
  @ManyToOne(() => Habit, (habit) => habit.todos, { nullable: true })
  @JoinColumn({ name: "habit_id" })
  habit?: Habit;

  /** 习惯ID */
  @Column('varchar', { nullable: true })
  habitId?: string;

  /** 来源 */
  @Column({
    type: 'simple-enum',
    enum: TodoSource,
    nullable: true
  })
  source?: TodoSource;
}