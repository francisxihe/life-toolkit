import 'reflect-metadata';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@business/common';
import { AiCapabilityKey, AiProviderKind, AiRunStatus } from '@true-north/enum';

@Entity('ai_run')
export class AiRun extends BaseEntity {
  @Column('varchar', { length: 64 })
  capabilityKey!: AiCapabilityKey | string;

  @Column({
    type: 'simple-enum',
    enum: AiRunStatus,
    default: AiRunStatus.PENDING,
  })
  status!: AiRunStatus;

  @Column({
    type: 'simple-enum',
    enum: AiProviderKind,
    nullable: true,
  })
  providerKind?: AiProviderKind;

  @Column('varchar', { length: 128, nullable: true })
  model?: string;

  @Column('varchar', { length: 255, nullable: true })
  baseUrlHost?: string;

  @Column('text', { nullable: true })
  requestSummary?: string;

  @Column('text', { nullable: true })
  responseSummary?: string;

  @Column('varchar', { length: 64, nullable: true })
  errorCode?: string;

  @Column('text', { nullable: true })
  errorMessage?: string;

  @Column('integer', { nullable: true })
  latencyMs?: number;

  @Column('varchar', { length: 64, nullable: true })
  refType?: string;

  @Column('varchar', { nullable: true })
  refId?: string;

  @Column('datetime', { nullable: true })
  finishedAt?: Date;
}
