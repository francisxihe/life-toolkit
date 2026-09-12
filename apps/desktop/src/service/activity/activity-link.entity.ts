import 'reflect-metadata';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@true-north/plugin-sdk/main';
import { ActivityDomain } from '@true-north/enum';

@Entity('activity_link')
export class ActivityLink extends BaseEntity {
  @Column('varchar')
  activityId!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  pluginId?: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  entityType?: string;

  @Column({ type: 'varchar', length: 32 })
  domain!: ActivityDomain;

  @Column('varchar')
  entityId!: string;

  @Column('varchar', { length: 32, nullable: true })
  role?: string;

  @Column('varchar', { length: 255, nullable: true })
  label?: string;
}
