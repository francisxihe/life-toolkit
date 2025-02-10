import {
  SubTodoVo,
  CreateSubTodoVo,
  SubTodoWithSubVo,
} from "@life-toolkit/vo/todo/sub-todo";
import {
  CreateSubTodoDto,
  UpdateSubTodoDto,
  SubTodoDto,
  SubTodoWithSubDto,
} from "../dto";
import { SubTodo, TodoStatus } from "../entities";
import dayjs from "dayjs";

export class SubTodoMapper {
  static entityToDto(entity: SubTodo): SubTodoDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      tags: entity.tags,
      importance: entity.importance,
      urgency: entity.urgency,
      parentId: entity.parentId,
      planStartAt: entity.planStartAt,
      planEndAt: entity.planEndAt,
      doneAt: entity.doneAt,
      abandonedAt: entity.abandonedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static dtoToVo(dto: SubTodoDto): SubTodoVo {
    const vo: SubTodoVo = {
      name: dto.name,
      description: dto.description,
      status: dto.status || TodoStatus.TODO,
      tags: dto.tags,
      importance: dto.importance,
      urgency: dto.urgency,
      planStartAt: dto.planStartAt,
      planEndAt: dto.planEndAt,
      parentId: dto.parentId,
      doneAt: dto.doneAt
        ? dayjs(dto.doneAt).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
      abandonedAt: dto.abandonedAt
        ? dayjs(dto.abandonedAt).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
      id: dto.id,
      updatedAt: dayjs(dto.updatedAt).format("YYYY/MM/DD HH:mm:ss"),
      createdAt: dayjs(dto.createdAt).format("YYYY/MM/DD HH:mm:ss"),
    };
    return vo;
  }

  static dtoToVoList(dtoList: SubTodoDto[]): SubTodoVo[] {
    return dtoList.map((dto) => this.dtoToVo(dto));
  }

  static dtoToWithSubVo(dto: SubTodoWithSubDto): SubTodoWithSubVo {
    return {
      ...this.dtoToVo(dto),
      subTodoList: this.dtoToVoList(dto.subTodoList),
    };
  }

  static voToCreateDto(vo: CreateSubTodoVo): CreateSubTodoDto {
    const dto = new CreateSubTodoDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.tags = vo.tags;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.parentId = vo.parentId;
    return dto;
  }

  static voToUpdateDto(vo: CreateSubTodoVo): UpdateSubTodoDto {
    const dto = new UpdateSubTodoDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.tags = vo.tags;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.parentId = vo.parentId;
    return dto;
  }
}
