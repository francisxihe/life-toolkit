import { TrackTime } from '../entity';
import { BaseModelDto, BaseMapper } from '@true-north/plugin-sdk/host';
import { IntersectionType } from 'francis-mapped-types';
import dayjs from 'dayjs';
import type { TrackTime as TrackTimeVO, ResponsePageVo, ResponseListVo } from '@true-north/vo';

// 没有关联字段的DTO
export class TrackTimeWithoutRelationsDto extends TrackTime {}

// 基础DTO - 包含所有字段
export class TrackTimeDto extends IntersectionType(BaseModelDto, TrackTimeWithoutRelationsDto) {
  // Entity → DTO (实例方法)
  importEntity(entity: TrackTime) {
    Object.assign(this, BaseMapper.entityToDto(entity));
    this.relatedType = entity.relatedType;
    this.relatedId = entity.relatedId;
    this.startAt = entity.startAt;
    this.endAt = entity.endAt;
    this.duration = entity.duration;
    this.notes = entity.notes;
  }

  // Entity → DTO (静态方法)
  static importEntity(entity: TrackTime): TrackTimeDto {
    const dto = new TrackTimeDto();
    dto.importEntity(entity);
    return dto;
  }

  exportWithoutRelationsVo(): TrackTimeVO.TrackTimeWithoutRelationsVo {
    return {
      ...BaseMapper.dtoToVo(this),
      relatedType: this.relatedType,
      relatedId: this.relatedId,
      startAt: this.startAt ? dayjs(this.startAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      endAt: this.endAt ? dayjs(this.endAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      duration: this.duration,
      notes: this.notes,
    } as TrackTimeVO.TrackTimeWithoutRelationsVo;
  }

  // DTO → 业务完整 VO
  exportVo(): TrackTimeVO.TrackTimeVo {
    return {
      ...this.exportWithoutRelationsVo(),
    };
  }

  // 列表/分页辅助
  static dtoListToListVo(list: TrackTimeDto[]): ResponseListVo<TrackTimeVO.TrackTimeWithoutRelationsVo> {
    return { list: list.map((d) => d.exportWithoutRelationsVo()) };
  }

  static dtoListToPageVo(
    list: TrackTimeDto[],
    total: number,
    pageNum: number,
    pageSize: number
  ): ResponsePageVo<TrackTimeVO.TrackTimeWithoutRelationsVo> {
    return {
      list: list.map((d) => d.exportWithoutRelationsVo()),
      total,
      pageNum,
      pageSize,
    };
  }
}
