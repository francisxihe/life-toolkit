import 'reflect-metadata';
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@true-north/plugin-sdk/main';
import { AiMessageRole } from '@true-north/enum';
import type { AiMessagePartVo } from '@true-north/vo';

@Entity('ai_message')
@Index('idx_ai_message_conversation', ['conversationId'])
export class AiMessage extends BaseEntity {
  @Column('varchar')
  conversationId!: string;

  @Column({
    type: 'simple-enum',
    enum: [AiMessageRole.USER, AiMessageRole.ASSISTANT],
  })
  role!: AiMessageRole.USER | AiMessageRole.ASSISTANT | 'user' | 'assistant';

  /** JSON array of AiMessagePartVo */
  @Column('simple-json')
  parts!: AiMessagePartVo[];
}
