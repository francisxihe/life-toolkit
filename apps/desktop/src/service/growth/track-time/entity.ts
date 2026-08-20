import { BaseEntity } from '@business/common';
import { TrackTimeRelatedType } from '@true-north/enum';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Task } from '../task/task.entity';

@Entity('track_time')
export class TrackTime extends BaseEntity {
  @Column({ type: 'datetime', nullable: true })
  startAt?: Date;

  @Column({ type: 'datetime', nullable: true })
  endAt?: Date;

  @Column({ type: 'int', nullable: true })
  duration?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  /** 关联类型 */
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  relatedType!: TrackTimeRelatedType;

  /** 关联ID */
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  relatedId!: string;

  /** 重复配置 */
  @ManyToOne(() => Task)
  @JoinColumn({ name: 'related_id' })
  task?: Task;
}
