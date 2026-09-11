import { TrackTime } from '../entity';
import { PartialType, PickType, IntersectionType } from 'francis-mapped-types';
import { TrackTimeWithoutRelationsDto, TrackTimeDto } from './track-time-model.dto';
import type { TrackTime as TrackTimeVO } from '@true-north/vo';
import dayjs from 'dayjs';

// 创建DTO - 选择需要的字段
export class CreateTrackTimeDto extends PickType(TrackTimeWithoutRelationsDto, [
  'relatedType',
  'relatedId',
  'startAt',
  'endAt',
  'duration',
  'notes',
] as const) {
  // VO → DTO
  importCreateVo(vo: TrackTimeVO.CreateTrackTimeVo) {
    this.relatedType = vo.relatedType;
    this.relatedId = vo.relatedId;
    this.duration = vo.duration;
    this.notes = vo.notes;

    // 日期字段转换 (string → Date)
    this.startAt = vo.startAt ? dayjs(vo.startAt).toDate() : undefined;
    this.endAt = vo.endAt ? dayjs(vo.endAt).toDate() : undefined;
  }

  exportCreateEntity(entity: TrackTime) {
    if (this.relatedType !== undefined) entity.relatedType = this.relatedType;
    if (this.relatedId !== undefined) entity.relatedId = this.relatedId;
    if (this.startAt !== undefined) entity.startAt = this.startAt;
    if (this.endAt !== undefined) entity.endAt = this.endAt;
    if (this.duration !== undefined) entity.duration = this.duration;
    if (this.notes !== undefined) entity.notes = this.notes;
  }
}

// 更新DTO - 基于创建DTO的部分字段 + 实体ID
export class UpdateTrackTimeDto extends IntersectionType(
  PartialType(CreateTrackTimeDto),
  PickType(TrackTime, ['id'] as const)
) {
  // VO → DTO
  importUpdateVo(vo: TrackTimeVO.UpdateTrackTimeVo) {
    // 只更新提供的字段
    if (vo.relatedType !== undefined) this.relatedType = vo.relatedType;
    if (vo.relatedId !== undefined) this.relatedId = vo.relatedId;
    if (vo.duration !== undefined) this.duration = vo.duration;
    if (vo.notes !== undefined) this.notes = vo.notes;

    // 日期字段转换 (string → Date)
    if (vo.startAt !== undefined) {
      this.startAt = vo.startAt ? dayjs(vo.startAt).toDate() : undefined;
    }
    if (vo.endAt !== undefined) {
      this.endAt = vo.endAt ? dayjs(vo.endAt).toDate() : undefined;
    }
  }

  /** 导出更新UpdateEntity */
  exportUpdateEntity() {
    const trackTime = new TrackTime();
    trackTime.id = this.id;
    if (this.relatedType !== undefined) trackTime.relatedType = this.relatedType;
    if (this.relatedId !== undefined) trackTime.relatedId = this.relatedId;
    if (this.startAt !== undefined) trackTime.startAt = this.startAt;
    if (this.endAt !== undefined) trackTime.endAt = this.endAt;
    if (this.duration !== undefined) trackTime.duration = this.duration;
    if (this.notes !== undefined) trackTime.notes = this.notes;
    return trackTime;
  }
}
