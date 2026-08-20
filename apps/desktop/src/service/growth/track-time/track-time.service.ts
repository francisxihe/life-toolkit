import { TrackTime } from './entity';
import { TrackTimeDto, CreateTrackTimeDto, UpdateTrackTimeDto, TrackTimeFilterDto } from './dto';
import { TrackTimeRepository } from './track-time.repository';
import { TrackTimeRelatedType } from '@true-north/enum';

export class TrackTimeService {
  constructor(private readonly trackTimeRepository: TrackTimeRepository) {}

  async create(createDto: CreateTrackTimeDto): Promise<TrackTimeDto> {
    if (createDto.duration === undefined) {
      throw new Error('专注时长不能为空');
    }
    this.assertValidDuration(createDto.duration, createDto.startAt, createDto.endAt);
    const entity = new TrackTime();
    createDto.exportCreateEntity(entity);

    const saved = await this.trackTimeRepository.create(entity);

    return TrackTimeDto.importEntity(saved);
  }

  async find(id: string): Promise<TrackTimeDto | null> {
    const entity = await this.trackTimeRepository.find(id);
    if (!entity) return null;

    return TrackTimeDto.importEntity(entity);
  }

  async update(updateDto: UpdateTrackTimeDto): Promise<TrackTimeDto> {
    this.assertValidDuration(updateDto.duration, updateDto.startAt, updateDto.endAt);
    const entity = updateDto.exportUpdateEntity();
    const saved = await this.trackTimeRepository.update(entity);

    return TrackTimeDto.importEntity(saved);
  }

  async delete(id: string): Promise<void> {
    await this.trackTimeRepository.delete(id);
  }

  async findByRelatedId(relatedType: TrackTimeRelatedType, relatedId: string): Promise<TrackTimeDto[]> {
    const trackTimeFilterDto = new TrackTimeFilterDto();
    trackTimeFilterDto.relatedType = relatedType;
    trackTimeFilterDto.relatedId = relatedId;
    const entities = await this.trackTimeRepository.findByFilter(trackTimeFilterDto);
    return entities.map((entity: TrackTime) => TrackTimeDto.importEntity(entity));
  }

  async findByFilter(filter: TrackTimeFilterDto): Promise<TrackTimeDto[]> {
    const entities = await this.trackTimeRepository.findByFilter(filter);
    return entities.map((entity: TrackTime) => TrackTimeDto.importEntity(entity));
  }

  async deleteByRelatedId(relatedType: TrackTimeRelatedType, relatedId: string): Promise<void> {
    const trackTimeFilterDto = new TrackTimeFilterDto();
    trackTimeFilterDto.relatedType = relatedType;
    trackTimeFilterDto.relatedId = relatedId;
    await this.trackTimeRepository.deleteByFilter(trackTimeFilterDto);
  }

  private assertValidDuration(duration?: number, startAt?: Date, endAt?: Date): void {
    if (duration !== undefined && (!Number.isInteger(duration) || duration <= 0)) {
      throw new Error('专注时长必须为正整数秒');
    }
    if (startAt && endAt && endAt.getTime() < startAt.getTime()) {
      throw new Error('结束时间不能早于开始时间');
    }
  }
}

export const trackTimeService = new TrackTimeService(new TrackTimeRepository());
