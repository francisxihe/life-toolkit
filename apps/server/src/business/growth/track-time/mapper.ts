import { TrackTime } from "./entity";
import { BaseMapper } from "@/base/base.mapper";
import {
  TrackTimeDto,
  CreateTrackTimeDto,
  UpdateTrackTimeDto,
} from "./dto";
import { TrackTime as TrackTimeVO } from "@life-toolkit/vo";
import dayjs from "dayjs";

class TrackTimeMapperEntity {
  static entityToDto(entity: TrackTime): TrackTimeDto {
    const dto = new TrackTimeDto();
    Object.assign(dto, BaseMapper.entityToDto(entity));
    dto.startAt = entity.startAt;
    dto.endAt = entity.endAt;
    dto.duration = entity.duration;
    dto.notes = entity.notes;
    return dto;
  }
}

class TrackTimeMapperDto extends TrackTimeMapperEntity {
  static dtoToVo(dto: TrackTimeDto): TrackTimeVO.TrackTimeVo {
    const vo: TrackTimeVO.TrackTimeVo = {
      ...BaseMapper.dtoToVo(dto),
      startAt: dto.startAt ? dayjs(dto.startAt).format("YYYY/MM/DD HH:mm:ss") : undefined,
      endAt: dto.endAt ? dayjs(dto.endAt).format("YYYY/MM/DD HH:mm:ss") : undefined,
      duration: dto.duration,
      notes: dto.notes,
    };
    return vo;
  }
}

class TrackTimeMapperVo extends TrackTimeMapperDto {}

export class TrackTimeMapper extends TrackTimeMapperVo {}