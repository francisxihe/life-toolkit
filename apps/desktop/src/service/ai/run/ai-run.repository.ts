import { AppDataSource } from '../../db/database.config';
import { BaseRepository as BaseRepositoryImpl } from '../../db/base.repository.impl';
import { AiRun } from './ai-run.entity';

export type AiRunFilterDto = {
  includeIds?: string[];
  excludeIds?: string[];
  capabilityKey?: string;
  status?: string;
  refType?: string;
  refId?: string;
};

export class AiRunRepository extends BaseRepositoryImpl<AiRun, AiRunFilterDto> {
  constructor() {
    function buildQuery(filter: AiRunFilterDto) {
      let qb = this.repo.createQueryBuilder('ai_run').andWhere('ai_run.deletedAt IS NULL');
      if (filter.includeIds?.length) {
        qb = qb.andWhere('ai_run.id IN (:...includeIds)', { includeIds: filter.includeIds });
      }
      if (filter.excludeIds?.length) {
        qb = qb.andWhere('ai_run.id NOT IN (:...excludeIds)', { excludeIds: filter.excludeIds });
      }
      if (filter.capabilityKey) {
        qb = qb.andWhere('ai_run.capabilityKey = :capabilityKey', { capabilityKey: filter.capabilityKey });
      }
      if (filter.status) {
        qb = qb.andWhere('ai_run.status = :status', { status: filter.status });
      }
      if (filter.refType) {
        qb = qb.andWhere('ai_run.refType = :refType', { refType: filter.refType });
      }
      if (filter.refId) {
        qb = qb.andWhere('ai_run.refId = :refId', { refId: filter.refId });
      }
      return qb.orderBy('ai_run.createdAt', 'DESC');
    }
    super(AppDataSource.getRepository(AiRun), buildQuery);
  }
}
