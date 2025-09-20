import { TrackTime } from './entity';
import { BaseModelDto, BaseModelDtoKeys, BaseMapper } from '@business/common';
import { OmitType, PartialType, IntersectionType, PickType } from 'francis-mapped-types';
import { TrackTime as TrackTimeVO } from '@life-toolkit/vo';
import dayjs from 'dayjs';

export class TrackTimeDto extends IntersectionType(
  BaseModelDto,
  PickType(TrackTime, ['startAt', 'endAt', 'duration', 'notes'] as const)
) {
  importEntity(entity: TrackTime) {
    Object.assign(this, BaseMapper.entityToDto(entity));
    this.startAt = entity.startAt;
    this.endAt = entity.endAt;
    this.duration = entity.duration;
    this.notes = entity.notes;
  }

  exportVo(): TrackTimeVO.TrackTimeVo {
    return {
      ...BaseMapper.dtoToVo(this),
      startAt: this.startAt ? dayjs(this.startAt).format('YYYY/MM/DD HH:mm:ss') : undefined,
      endAt: this.endAt ? dayjs(this.endAt).format('YYYY/MM/DD HH:mm:ss') : undefined,
      duration: this.duration,
      notes: this.notes,
    };
  }
}

export class CreateTrackTimeDto extends OmitType(TrackTimeDto, [...BaseModelDtoKeys]) {}

export class UpdateTrackTimeDto extends IntersectionType(
  PartialType(CreateTrackTimeDto),
  PickType(TrackTime, ['id'] as const)
) {}
