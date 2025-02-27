import type { Goal as GoalVO } from "@life-toolkit/vo";
import { CreateGoalDto, UpdateGoalDto, GoalDto, GoalModelDto } from "../dto";
import { GoalStatus, Goal } from "../entities";
import { BaseMapper } from "@/base/base.mapper";
import dayjs from "dayjs";

class GoalMapperEntity {
  static entityToModelDto(entity: Goal): GoalModelDto {
    const dto = new GoalModelDto();
    Object.assign(dto, BaseMapper.entityToDto(entity));
    dto.name = entity.name;
    dto.description = entity.description;
    dto.status = entity.status;
    dto.type = entity.type;
    dto.importance = entity.importance;
    dto.urgency = entity.urgency;
    dto.doneAt = entity.doneAt;
    dto.abandonedAt = entity.abandonedAt;
    dto.startAt = entity.startAt;
    dto.endAt = entity.endAt;
    return dto;
  }

  static entityToDto(entity: Goal): GoalDto {
    const dto = new GoalDto();
    Object.assign(dto, BaseMapper.entityToDto(entity));
    Object.assign(dto, this.entityToModelDto(entity));
    dto.parent = entity.parent;
    dto.children = entity.children;
    return dto;
  }
}

class GoalMapperDto extends GoalMapperEntity {
  static dtoToItemVo(dto: GoalDto) {
    const vo: GoalVO.GoalItemVo = {
      ...BaseMapper.dtoToVo(dto),
      name: dto.name || "",
      description: dto.description,
      status: dto.status || GoalStatus.TODO,
      importance: dto.importance,
      urgency: dto.urgency,
      startAt: dto.startAt
        ? dayjs(dto.startAt).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
      endAt: dto.endAt
        ? dayjs(dto.endAt).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
      doneAt: dto.doneAt
        ? dayjs(dto.doneAt).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
      abandonedAt: dto.abandonedAt
        ? dayjs(dto.abandonedAt).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
    };
    return vo;
  }

  static dtoToVo(dto: GoalDto): GoalVO.GoalVo {
    const vo: GoalVO.GoalVo = {
      ...this.dtoToItemVo(dto),
      parent: dto.parent ? this.dtoToVo(dto.parent) : undefined,
      children: dto.children?.map((child) => this.dtoToVo(child)) || [],
    };
    return vo;
  }

  static dtoToVoList(dtoList: GoalDto[]): GoalVO.GoalItemVo[] {
    return dtoList.map((dto) => this.dtoToItemVo(dto));
  }

  static dtoToPageVo(
    dtoList: GoalDto[],
    total: number,
    pageNum: number,
    pageSize: number
  ): GoalVO.GoalPageVo {
    const vo = {
      list: this.dtoToVoList(dtoList),
      total,
      pageNum,
      pageSize,
    };
    return vo;
  }

  static dtoToListVo(dtoList: GoalDto[]): GoalVO.GoalListVo {
    const vo = {
      list: this.dtoToVoList(dtoList),
    };
    return vo;
  }
}

class GoalMapperVo extends GoalMapperDto {
  static voToCreateDto(vo: GoalVO.CreateGoalVo): CreateGoalDto {
    const dto = new CreateGoalDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.parentId = vo.parentId;
    dto.startAt = vo.startAt ? dayjs(vo.startAt).toDate() : undefined;
    dto.endAt = vo.endAt ? dayjs(vo.endAt).toDate() : undefined;
    return dto;
  }

  static voToUpdateDto(vo: GoalVO.CreateGoalVo): UpdateGoalDto {
    const dto = new UpdateGoalDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.parentId = vo.parentId;
    dto.startAt = vo.startAt ? dayjs(vo.startAt).toDate() : undefined;
    dto.endAt = vo.endAt ? dayjs(vo.endAt).toDate() : undefined;
    return dto;
  }
}

export class GoalMapper extends GoalMapperVo {}
