import 'reflect-metadata';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@true-north/plugin-sdk/host';
import { ActivitySource } from '@true-north/enum';

@Entity('activity')
export class Activity extends BaseEntity {
  @Column('datetime')
  occurredAt!: Date;

  @Column('varchar', { length: 255 })
  title!: string;

  @Column('text', { nullable: true })
  summary?: string;

  @Column({ type: 'varchar', length: 32 })
  source!: ActivitySource;

  @Column('varchar', { nullable: true })
  captureMessageId?: string;
}
