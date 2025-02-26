import { BaseEntity } from "./base.entity";
import { BaseModelDto } from "./base-model.dto";
import { BaseModelVo } from "@life-toolkit/vo";
import dayjs from "dayjs";
export class BaseMapper {
  static entityToDto(entity: BaseEntity): BaseModelDto {
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }

  static dtoToVo(dto: BaseModelDto): BaseModelVo {
    return {
      id: dto.id,
      createdAt: dayjs(dto.createdAt).format("YYYY/MM/DD HH:mm:ss"),
      updatedAt: dayjs(dto.updatedAt).format("YYYY/MM/DD HH:mm:ss"),
    };
  }
}