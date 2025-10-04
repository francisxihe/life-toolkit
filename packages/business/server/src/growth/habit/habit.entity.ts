import 'reflect-metadata';
import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Difficulty, HabitStatus, Importance } from '@life-toolkit/enum';
import { BaseEntity } from '@business/common';
import { RepeatMode, RepeatEndMode } from 'francis-types-repeat';
import type { RepeatConfig } from 'francis-types-repeat';
import { Goal } from '../goal';
import { Todo } from '../todo';

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

  /** 习惯模式 */
  @Column({
    type: 'varchar',
    length: 20,
  })
  repeatMode!: RepeatMode;

  /** 习惯配置 */
  @Column({
    type: 'text',
    nullable: true,
    transformer: {
      to: (value) => JSON.stringify(value),
      from: (value) => JSON.parse(value),
    },
  })
  repeatConfig?: RepeatConfig;

  /** 习惯结束模式 */
  @Column({
    type: 'varchar',
    length: 20,
  })
  repeatEndMode!: RepeatEndMode;

  /** 习惯结束日期 */
  @Column({
    type: 'date',
    nullable: true,
  })
  repeatEndDate?: string;

  /** 习惯次数 */
  @Column({
    type: 'int',
    nullable: true,
  })
  repeatTimes?: number;

  /** 习惯开始日期 */
  @Column('date', { nullable: true })
  repeatStartDate!: string;
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

  /** 关联的待办事项（习惯产生的具体待办任务） */
  @OneToMany(() => Todo, (todo) => todo.habit, { cascade: true })
  todos!: Todo[];
}
