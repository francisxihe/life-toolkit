import 'reflect-metadata';
import { Entity, Column, ManyToMany, JoinTable, ManyToOne, JoinColumn } from 'typeorm';
import { Difficulty, HabitStatus, Importance } from '@true-north/enum';
import { BaseEntity } from '@business/common';
import { Goal } from '../goal/goal.entity';
import { Repeat } from '../repeat/repeat.entity';

export class HabitWithoutRelations extends BaseEntity {
  /** 习惯名称 */
  @Column('varchar', { length: 255 })
  name!: string;

  /** 习惯状态 */
  @Column({
    type: 'simple-enum',
    enum: HabitStatus,
    default: HabitStatus.ACTIVE,
  })
  status!: HabitStatus;

  /** 习惯描述 */
  @Column('text', { nullable: true })
  description?: string;

  /** 习惯重要程度 */
  @Column({
    type: 'simple-enum',
    enum: Importance,
    default: Importance.Core,
  })
  importance?: Importance;

  /** 习惯标签 */
  @Column('simple-array', { nullable: true })
  tags!: string[];

  /** 习惯难度 */
  @Column({
    type: 'simple-enum',
    enum: Difficulty,
    default: Difficulty.Skilled,
  })
  difficulty!: Difficulty;

  /** 关联的调度规则 */
  @Column('varchar', { nullable: true })
  repeatId?: string;

  /** 当前待结算的习惯周期待办 */
  @Column('varchar', { nullable: true })
  cycleTodoId?: string;

  /** 已创建的周期实例数（首个实例计入） */
  @Column('int', { default: 0 })
  cycleCount!: number;

  @Column('int', { default: 0 })
  currentStreak!: number;

  @Column('int', { default: 0 })
  longestStreak!: number;

  @Column('int', { default: 0 })
  completedCount!: number;

  @Column('datetime', { nullable: true })
  doneAt?: Date;

  @Column('datetime', { nullable: true })
  abandonedAt?: Date;
}

@Entity('habit')
export class Habit extends HabitWithoutRelations {
  /** 关联的目标 */
  @ManyToMany(() => Goal, { cascade: true })
  @JoinTable({
    name: 'habit_goal',
    joinColumn: { name: 'habit_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'goal_id', referencedColumnName: 'id' },
  })
  goals!: Goal[];

  @ManyToOne(() => Repeat, { nullable: true })
  @JoinColumn({ name: 'repeat_id' })
  repeat?: Repeat;
}
