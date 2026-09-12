import { store } from '../../storage';
import { Repeat } from './repeat.entity';
import { BaseRepository } from '@true-north/plugin-sdk/main';
import { BaseRepositoryImpl } from '@true-north/plugin-sdk/main';

export type RepeatFilterDto = {
  includeIds?: string[];
  excludeIds?: string[];
  keyword?: string;
  currentDateStart?: string;
  currentDateEnd?: string;
};

export interface RepeatRepository extends BaseRepository<Repeat, RepeatFilterDto> {}

export class RepeatRepository
  extends BaseRepositoryImpl<Repeat, RepeatFilterDto>
  implements RepeatRepository
{
  constructor() {
    function buildQuery(filter: RepeatFilterDto) {
      const qb = this.repo.createQueryBuilder('repeat');

      if (filter.includeIds?.length) {
        qb.andWhere('repeat.id IN (:...includeIds)', { includeIds: filter.includeIds });
      }
      if (filter.excludeIds?.length) {
        qb.andWhere('repeat.id NOT IN (:...excludeIds)', { excludeIds: filter.excludeIds });
      }
      if (filter.currentDateStart) {
        qb.andWhere('repeat.currentDate >= :cds', { cds: filter.currentDateStart });
      }
      if (filter.currentDateEnd) {
        qb.andWhere('repeat.currentDate <= :cde', { cde: filter.currentDateEnd });
      }

      return qb;
    }

    super(() => store().getRepository(Repeat), buildQuery);
  }
}
