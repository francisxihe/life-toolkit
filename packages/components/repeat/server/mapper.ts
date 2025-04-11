import { CreateRepeatDto, UpdateRepeatDto, RepeatDto } from "./dto";
import { Repeat } from "./entity";
import { RepeatVo, CreateRepeatVo, UpdateRepeatVo } from "../vo";

export class RepeatMapperEntity {
  static entityToDto(entity: Repeat): RepeatDto {
    const dto = new RepeatDto();
    dto.repeatMode = entity.repeatMode;
    dto.repeatConfig = entity.repeatConfig;
    dto.repeatTimes = entity.repeatTimes;
    dto.repeatEndDate = entity.repeatEndDate;
    return dto;
  }
}

class RepeatMapperDto extends RepeatMapperEntity {
  static dtoToVo(dto: RepeatDto): RepeatVo {
    const vo: RepeatVo = {
      repeatMode: dto.repeatMode,
      repeatConfig: dto.repeatConfig,
      repeatEndMode: dto.repeatEndMode,
      repeatTimes: dto.repeatTimes,
      repeatEndDate: dto.repeatEndDate,
    };
    return vo;
  }
}

class RepeatMapperVo extends RepeatMapperDto {
  static voToCreateDto(vo: CreateRepeatVo): CreateRepeatDto {
    const dto = new CreateRepeatDto();
    dto.repeatMode = vo.repeatMode;
    dto.repeatConfig = vo.repeatConfig;
    dto.repeatEndMode = vo.repeatEndMode;
    dto.repeatTimes = vo.repeatTimes;
    dto.repeatEndDate = vo.repeatEndDate;
    return dto;
  }

  static voToUpdateDto(vo: UpdateRepeatVo): UpdateRepeatDto {
    const dto = new UpdateRepeatDto();
    dto.repeatMode = vo.repeatMode;
    dto.repeatConfig = vo.repeatConfig;
    dto.repeatEndMode = vo.repeatEndMode;
    dto.repeatTimes = vo.repeatTimes;
    dto.repeatEndDate = vo.repeatEndDate;
    return dto;
  }
}

export class RepeatMapper extends RepeatMapperVo {}
