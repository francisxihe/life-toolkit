import 'reflect-metadata';
import { BaseEntity } from '@business/common';
import { GoalType, GoalStatus, Importance, Difficulty } from '@life-toolkit/enum';
import { Task } from '../task';
import { Entity, Column, TreeChildren, TreeParent, Tree, OneToMany } from 'typeorm';
import { IsEnum, IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class GoalWithoutRelations extends BaseEntity {
  /** 目标名称 */
  @Column('varchar', { length: 255 })
  name!: string;

  /** 目标类型 */
  @Column({
    type: 'simple-enum',
    enum: GoalType,
  })
  type!: GoalType;

  /** 目标状态 */
  @Column({
    type: 'simple-enum',
    enum: GoalStatus,
    default: GoalStatus.TODO,
  })
  status!: GoalStatus;

  /** 目标重要程度 */
  @Column({
    type: 'simple-enum',
    enum: Importance,
    default: Importance.Supplementary,
  })
  importance!: Importance;

  /** 目标难度 */
  @Column({
    type: 'simple-enum',
    enum: Difficulty,
    default: Difficulty.GettingStarted,
  })
  difficulty?: Difficulty;

  /** 目标开始时间 */
  @Column('datetime', { nullable: true })
  startAt?: Date;

  /** 目标结束时间 */
  @Column('datetime', { nullable: true })
  endAt?: Date;

  /** 目标描述 */
  @Column('text', { nullable: true })
  description?: string;

  /** 目标完成时间 */
  @Column('datetime', { nullable: true })
  doneAt?: Date;

  /** 放弃目标时间 */
  @Column('datetime', { nullable: true })
  abandonedAt?: Date;

  /** 父ID */
  @Column('varchar', { nullable: true })
  @IsString()
  @IsOptional()
  parentId?: string;
}

@Entity('goal')
@Tree('closure-table')
export class Goal extends GoalWithoutRelations {
  /** 父目标 */
  @TreeParent({
    onDelete: 'CASCADE',
  })
  parent?: Goal;

  /** 子目标 */
  @TreeChildren({
    cascade: true,
  })
  children!: Goal[];

  /** 任务 */
  @OneToMany(() => Task, (task) => task.goal)
  taskList!: Task[];
}
