import { store } from '../../storage';
import { TrackTimeFilterDto } from './dto';
import { TrackTime } from './entity';
import { BaseRepository } from '@true-north/plugin-sdk/host';
import { BaseRepositoryImpl } from '@true-north/plugin-sdk/host';

export interface TrackTimeRepository extends BaseRepository<TrackTime, TrackTimeFilterDto> {
  findWithRelations(id: string, relations?: string[]): Promise<TrackTime>;
}

export class TrackTimeRepository
  extends BaseRepositoryImpl<TrackTime, TrackTimeFilterDto>
  implements TrackTimeRepository
{
  constructor() {
    function buildQuery(filter: TrackTimeFilterDto) {
      const qb = this.repo.createQueryBuilder('trackTime');

      if (filter.relatedType !== undefined) {
        qb.andWhere('trackTime.relatedType = :relatedType', { relatedType: filter.relatedType });
      }
      if (filter.relatedId !== undefined) {
        qb.andWhere('trackTime.relatedId = :relatedId', { relatedId: filter.relatedId });
      }

      return qb;
    }

    super(() => store().getRepository(TrackTime), buildQuery);
  }

  async findWithRelations(id: string, relations?: string[]): Promise<TrackTime> {
    const trackTime = await this.repo.findOne({
      where: { id },
      relations: relations || [],
    });
    if (!trackTime) throw new Error('TrackTime not found');
    return trackTime;
  }
}
