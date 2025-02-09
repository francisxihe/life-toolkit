import { SubTodoVO, CreateSubTodoVO } from "@life-toolkit/vo/todo/sub-todo";
import { CreateSubTodoDto, UpdateSubTodoDto, SubTodoDto } from "./sub-todo-dto";
import { TodoStatus } from "../entities/base.entity";
import dayjs from "dayjs";
import { SubTodo } from "../entities/sub-todo.entity";
export class SubTodoMapper {
  static dtoToVO(dto: SubTodoDto): SubTodoVO {
    const vo: SubTodoVO = {
      name: dto.name,
      description: dto.description,
      status: dto.status || TodoStatus.TODO,
      tags: dto.tags,
      importance: dto.importance,
      urgency: dto.urgency,
      planStartAt: dto.planStartAt,
      planEndAt: dto.planEndAt,
      parentId: dto.parentId,
      id: dto.id,
      updatedAt: dayjs(dto.updatedAt).format("YYYY/MM/DD HH:mm:ss"),
      createdAt: dayjs(dto.createdAt).format("YYYY/MM/DD HH:mm:ss"),
    };
    return vo;
  }

  static dtoToVOList(dtoList: SubTodoDto[]): SubTodoVO[] {
    return dtoList.map((dto) => this.dtoToVO(dto));
  }

  static voToCreateDto(vo: CreateSubTodoVO): CreateSubTodoDto {
    const dto = new CreateSubTodoDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.status = vo.status as TodoStatus;
    dto.tags = vo.tags;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.parentId = vo.parentId;
    return dto;
  }

  static voToUpdateDto(vo: CreateSubTodoVO): UpdateSubTodoDto {
    const dto = new UpdateSubTodoDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.status = vo.status as TodoStatus;
    dto.tags = vo.tags;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.parentId = vo.parentId;
    return dto;
  }

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
}
