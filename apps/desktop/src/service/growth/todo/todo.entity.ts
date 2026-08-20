import 'reflect-metadata';
import { BaseEntity } from '@business/common';
import { TodoStatus, TodoRelatedType } from '@true-north/enum';
import { Entity, Column } from 'typeorm';
import { IsString, IsOptional, IsEnum, IsNumber, IsISO8601 } from 'class-validator';
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
  planStartTime?: string;

  /** 计划待办结束时间 */
  @Column('time', { nullable: true })
  planEndTime?: string;

  /** 计划待办日期 */
  @Column('date')
  @IsISO8601()
  planDate!: Date;

  /** 关联类型 */
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  @IsOptional()
  relatedType?: TodoRelatedType;

  /** 关联ID（主人 id；relatedType=repeat 时为 repeat_todo.id） */
  @Column('varchar', { nullable: true })
  @IsString()
  @IsOptional()
  relatedId?: string;
}

@Entity('todo')
export class Todo extends TodoWithoutRelations {}
