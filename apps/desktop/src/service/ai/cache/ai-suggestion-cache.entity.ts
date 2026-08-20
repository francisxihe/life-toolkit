import 'reflect-metadata';
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@business/common';
import { AiCapabilityKey } from '@true-north/enum';

@Entity('ai_suggestion_cache')
@Index('idx_ai_suggestion_cache_lookup', ['capabilityKey', 'refType', 'refId'], { unique: true })
export class AiSuggestionCache extends BaseEntity {
  @Column('varchar', { length: 64 })
  capabilityKey!: AiCapabilityKey | string;

  @Column('varchar', { length: 64 })
  refType!: string;

  @Column('varchar')
  refId!: string;

  @Column('varchar', { length: 64 })
  contextFingerprint!: string;

  @Column('varchar', { length: 64 })
  runId!: string;

  @Column('text')
  payloadJson!: string;
}
