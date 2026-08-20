import 'reflect-metadata';
import { Entity, Column } from 'typeorm';
import { RepeatMode, RepeatEndMode, type RepeatConfigPayload } from '@true-north/components-repeat/types';
import { BaseEntity } from '@business/common';

export class RepeatWithoutRelations extends BaseEntity {
  /** 重复模式 */
  @Column({
    type: 'varchar',
    length: 20,
  })
  repeatMode!: RepeatMode;

  /** 重复配置 */
  @Column({
    type: 'text',
    nullable: true,
    transformer: {
      to: (value) => JSON.stringify(value),
      from: (value) => {
        if (value === null || value === undefined) return undefined;
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      },
    },
  })
  repeatConfig?: RepeatConfigPayload;

  /** 重复结束模式 */
  @Column({
    type: 'varchar',
    length: 20,
  })
  repeatEndMode!: RepeatEndMode;

  /** 重复结束日期 */
  @Column({
    type: 'date',
    nullable: true,
  })
  repeatEndDate?: string;

  /** 重复次数 */
  @Column({
    type: 'int',
    nullable: true,
  })
  repeatTimes?: number;

  /** 重复开始日期 */
  @Column('date', { nullable: true })
  repeatStartDate!: string;

  /** 当前执行到的重复日期（游标） */
  @Column('date', { nullable: true })
  currentDate!: string;
}

@Entity('repeat')
export class Repeat extends RepeatWithoutRelations {}
