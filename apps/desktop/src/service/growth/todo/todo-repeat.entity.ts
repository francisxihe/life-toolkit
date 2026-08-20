import 'reflect-metadata';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TodoRepeatStatus } from '@true-north/enum';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseEntity } from '@business/common';
import { Repeat } from '../repeat/repeat.entity';

export class TodoRepeatWithoutRelations extends BaseEntity {
  /** 内容名称 */
  @Column('varchar', { nullable: true })
  @IsString()
  @IsOptional()
  name!: string;

  /** 内容描述 */
  @Column('text', { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  /** 重要程度 */
  @Column('int', { nullable: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  importance?: number;

  /** 紧急程度 */
  @Column('int', { nullable: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  urgency?: number;

  /** 计划待办开始时间 */
  @Column('time', { nullable: true })
  planStartTime?: string;

  /** 计划待办结束时间 */
  @Column('time', { nullable: true })
  planEndTime?: string;

  /** 系列生命周期（非实例 TodoStatus） */
  @Column({
    type: 'varchar',
    length: 20,
    default: TodoRepeatStatus.ACTIVE,
  })
  @IsEnum(TodoRepeatStatus)
  @IsOptional()
  status!: TodoRepeatStatus;

  /** 放弃时间 */
  @Column('datetime', { nullable: true })
  abandonedAt?: Date;

  /** 关联的调度规则 */
  @Column('varchar', { nullable: true })
  @IsString()
  @IsOptional()
  repeatId!: string;
}

@Entity('repeat_todo')
export class TodoRepeat extends TodoRepeatWithoutRelations {
  @ManyToOne(() => Repeat, { nullable: true })
  @JoinColumn({ name: 'repeat_id' })
  repeat?: Repeat;
}
