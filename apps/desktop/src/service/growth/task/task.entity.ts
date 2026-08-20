import 'reflect-metadata';
import { BaseEntity } from '@business/common';
import { Difficulty, TaskStatus } from '@true-north/enum';
import { Goal } from '../goal/goal.entity';
import { Entity, Column, TreeChildren, TreeParent, Tree, ManyToOne } from 'typeorm';
import { IsEnum, IsOptional, IsString, IsNumber, IsArray } from 'class-validator';
import type { Todo } from '../todo/todo.entity';

export class TaskWithoutRelations extends BaseEntity {
  /** 任务名称 */
  @Column('varchar')
  @IsString()
  name!: string;

  /** 任务事项状态 */
  @Column({
    type: 'varchar',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus)
  status!: TaskStatus;

  /** 任务预估时间（秒） */
  @Column('integer', { nullable: true })
  @IsNumber()
  @IsOptional()
  estimateTime?: number;

  /** 任务跟踪时间ID列表 */
  @Column('simple-array', {
    nullable: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  trackTimeIds!: string[];

  /** 任务描述 */
  @Column('text', { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  /** 任务重要程度 */
  @Column('int', { nullable: true })
  @IsNumber()
  @IsOptional()
  importance?: number;

  /** 任务难度 */
  @Column({
    type: 'simple-enum',
    enum: Difficulty,
    nullable: true,
  })
  @IsOptional()
  difficulty?: Difficulty;

  /** 任务紧急程度 */
  @Column('int', { nullable: true })
  @IsNumber()
  @IsOptional()
  urgency?: number;

  /** 任务标签 */
  @Column('simple-array')
  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  /** 任务完成时间 */
  @Column('datetime', {
    nullable: true,
  })
  doneAt?: Date;

  /** 放弃任务时间 */
  @Column('datetime', {
    nullable: true,
  })
  abandonedAt?: Date;

  /** 计划任务开始时间 */
  @Column('datetime', { nullable: true })
  startAt?: Date;

  /** 计划任务结束时间 */
  @Column('datetime', { nullable: true })
  endAt?: Date;

  /** 父ID */
  @Column('varchar', { nullable: true })
  @IsString()
  @IsOptional()
  parentId?: string;

  /** 目标ID */
  @Column('varchar', { nullable: true })
  @IsString()
  @IsOptional()
  goalId?: string;
}

@Entity('task')
@Tree('closure-table')
export class Task extends TaskWithoutRelations {
  /** 父任务 */
  @TreeParent({
    onDelete: 'CASCADE',
  })
  @IsOptional()
  parent?: Task;

  /** 子任务 */
  @TreeChildren({
    cascade: true,
  })
  children!: Task[];

  /** 目标 */
  @ManyToOne(() => Goal, (goal) => goal.taskList)
  @IsOptional()
  goal?: Goal;

  /** 任务下的待办（按 relatedType/relatedId 手动加载，非 TypeORM 关系列） */
  todoList?: Todo[];
}
