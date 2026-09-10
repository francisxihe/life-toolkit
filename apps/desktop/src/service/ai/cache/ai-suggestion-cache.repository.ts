import { AppDataSource } from '../../db/database.config';
import { BaseRepository as BaseRepositoryImpl } from '../../db/base.repository.impl';
import { AiSuggestionCache } from './ai-suggestion-cache.entity';

export type AiSuggestionCacheFilterDto = {
  includeIds?: string[];
  excludeIds?: string[];
  capabilityKey?: string;
  refType?: string;
  refId?: string;
};

export class CacheRepository extends BaseRepositoryImpl<
  AiSuggestionCache,
  AiSuggestionCacheFilterDto
> {
  constructor() {
    function buildQuery(filter: AiSuggestionCacheFilterDto) {
      let qb = this.repo
        .createQueryBuilder('ai_suggestion_cache')
        .andWhere('ai_suggestion_cache.deletedAt IS NULL');
      if (filter.includeIds?.length) {
        qb = qb.andWhere('ai_suggestion_cache.id IN (:...includeIds)', {
          includeIds: filter.includeIds,
        });
      }
      if (filter.excludeIds?.length) {
        qb = qb.andWhere('ai_suggestion_cache.id NOT IN (:...excludeIds)', {
          excludeIds: filter.excludeIds,
        });
      }
      if (filter.capabilityKey) {
        qb = qb.andWhere('ai_suggestion_cache.capabilityKey = :capabilityKey', {
          capabilityKey: filter.capabilityKey,
        });
      }
      if (filter.refType) {
        qb = qb.andWhere('ai_suggestion_cache.refType = :refType', { refType: filter.refType });
      }
      if (filter.refId) {
        qb = qb.andWhere('ai_suggestion_cache.refId = :refId', { refId: filter.refId });
      }
      return qb.orderBy('ai_suggestion_cache.updatedAt', 'DESC');
    }
    super(AppDataSource.getRepository(AiSuggestionCache), buildQuery);
  }

  async findOneByLookup(
    capabilityKey: string,
    refType: string,
    refId: string
  ): Promise<AiSuggestionCache | null> {
    const list = await this.findByFilter({ capabilityKey, refType, refId });
    return list[0] ?? null;
  }
}
