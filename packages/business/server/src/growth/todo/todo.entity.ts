import 'reflect-metadata';
import { BaseEntity } from '@business/common';
import { TodoStatus, TodoSource } from '@life-toolkit/enum';
import { Task } from '../task';
import { TodoRepeat } from './todo-repeat.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsOptional, IsEnum, IsArray, IsNumber, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';

export class TodoWithoutRelations extends BaseEntity {
  /** 待办名称 */
  @Column('varchar')
  @IsString()
  name!: string;

  /** 待办事项状态 */
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  @IsEnum(TodoStatus)
  status!: TodoStatus;

  /** 待办描述 */
  @Column('text', { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  /** 待办重要程度 */
  @Column('int', { nullable: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  importance?: number;

  /** 待办紧急程度 */
  @Column('int', { nullable: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  urgency?: number;

  /** 待办标签 */
  @Column('simple-array')
  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  /** 待办完成时间 */
  @Column('datetime', {
    nullable: true,
  })
  doneAt?: Date;

  /** 放弃待办时间 */
  @Column('datetime', {
    nullable: true,
  })
  abandonedAt?: Date;

  /** 计划待办开始时间 */
  @Column('time', { nullable: true })
  planStartAt?: string;

  /** 计划待办结束时间 */
  @Column('time', { nullable: true })
  planEndAt?: string;

  /** 计划待办日期 */
  @Column('date')
  @IsISO8601()
  planDate: Date = new Date();

  /** 来源 */
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  @IsOptional()
  source?: TodoSource;

  /** 任务ID */
  @Column('varchar', { nullable: true })
  @IsString()
  @IsOptional()
  taskId?: string;

  /** 重复配置ID */
  @Column('varchar', { nullable: true })
  @IsString()
  @IsOptional()
  repeatId?: string;

  /** 习惯ID */
  @Column('varchar', { nullable: true })
  @IsString()
  @IsOptional()
  habitId?: string;
}

@Entity('todo')
export class Todo extends TodoWithoutRelations {
  /** 关联的任务 */
  @ManyToOne(() => Task, (task) => task.todoList)
  task?: Task;

  /** 重复配置 */
  @ManyToOne(() => TodoRepeat, (repeat) => repeat.todos, { nullable: true })
  @JoinColumn({ name: 'repeat_id' })
  repeat?: TodoRepeat;

  /** 关联的习惯 */
  @ManyToOne('Habit', 'todos', { nullable: true })
  @JoinColumn({ name: 'habit_id' })
  habit?: any;
}
