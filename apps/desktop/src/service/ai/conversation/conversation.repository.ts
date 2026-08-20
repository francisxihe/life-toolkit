import { AppDataSource } from '../../db/database.config';
import { BaseRepository as BaseRepositoryImpl } from '../../db/base.repository.impl';
import { AiConversation } from './conversation.entity';

export type AiConversationFilterDto = {
  includeIds?: string[];
  excludeIds?: string[];
  refType?: 'goal' | 'task';
  refId?: string;
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
      return qb.orderBy('ai_conversation.updatedAt', 'DESC');
    }
    super(AppDataSource.getRepository(AiConversation), buildQuery);
  }
}
