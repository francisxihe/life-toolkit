import 'reflect-metadata';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@true-north/plugin-sdk/host';

@Entity('ai_conversation')
export class AiConversation extends BaseEntity {
  @Column('varchar', { length: 255 })
  title!: string;

  @Column('varchar', { length: 16, nullable: true })
  refType?: 'goal' | 'task' | null;

  @Column('varchar', { nullable: true })
  refId?: string | null;

  @Column('varchar', { length: 64, nullable: true })
  runtimeId?: string | null;

  @Column('varchar', { length: 128, nullable: true })
  runtimeThreadId?: string | null;

  @Column('boolean', { default: false })
  pinned!: boolean;

  @Column('varchar', { length: 16, nullable: true })
  purpose?: 'chat' | 'capture' | null;
}
