import { store } from '../storage';
import { BaseRepositoryImpl } from '@true-north/plugin-sdk/host';
import { AiConversation } from './conversation.entity';

export type AiConversationFilterDto = {
  includeIds?: string[];
  excludeIds?: string[];
  refType?: string;
  refId?: string;
  purpose?: 'chat' | 'capture';
};

export class AiConversationRepository extends BaseRepositoryImpl<AiConversation, AiConversationFilterDto> {
  constructor() {
    function buildQuery(filter: AiConversationFilterDto) {
      let qb = this.repo.createQueryBuilder('ai_conversation').andWhere('ai_conversation.deletedAt IS NULL');
      if (filter.includeIds?.length) {
        qb = qb.andWhere('ai_conversation.id IN (:...includeIds)', { includeIds: filter.includeIds });
      }
      if (filter.excludeIds?.length) {
        qb = qb.andWhere('ai_conversation.id NOT IN (:...excludeIds)', { excludeIds: filter.excludeIds });
      }
      if (filter.refType) {
        qb = qb.andWhere('ai_conversation.refType = :refType', { refType: filter.refType });
      }
      if (filter.refId) {
        qb = qb.andWhere('ai_conversation.refId = :refId', { refId: filter.refId });
      }
      if (filter.purpose) {
        qb = qb.andWhere('ai_conversation.purpose = :purpose', { purpose: filter.purpose });
      }
      return qb
        .orderBy('ai_conversation.pinned', 'DESC')
        .addOrderBy('ai_conversation.updatedAt', 'DESC');
    }
    super(() => store().getRepository(AiConversation), buildQuery);
  }

  async setPinned(id: string, pinned: boolean): Promise<AiConversation> {
    await this.find(id);
    await this.repo.query('UPDATE ai_conversation SET pinned = ? WHERE id = ?', [pinned ? 1 : 0, id]);
    return this.find(id);
  }
}
