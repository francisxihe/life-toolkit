import { AppDataSource } from '../../db/database.config';
import { BaseRepository as BaseRepositoryImpl } from '../../db/base.repository.impl';
import { AiMessage } from './message.entity';

export type AiMessageFilterDto = {
  includeIds?: string[];
  excludeIds?: string[];
  conversationId?: string;
};

export class AiMessageRepository extends BaseRepositoryImpl<AiMessage, AiMessageFilterDto> {
  constructor() {
    function buildQuery(filter: AiMessageFilterDto) {
      let qb = this.repo.createQueryBuilder('ai_message').andWhere('ai_message.deletedAt IS NULL');
      if (filter.includeIds?.length) {
        qb = qb.andWhere('ai_message.id IN (:...includeIds)', { includeIds: filter.includeIds });
      }
      if (filter.excludeIds?.length) {
        qb = qb.andWhere('ai_message.id NOT IN (:...excludeIds)', { excludeIds: filter.excludeIds });
      }
      if (filter.conversationId) {
        qb = qb.andWhere('ai_message.conversationId = :conversationId', {
          conversationId: filter.conversationId,
        });
      }
      return qb.orderBy('ai_message.createdAt', 'ASC');
    }
    super(AppDataSource.getRepository(AiMessage), buildQuery);
  }
}
