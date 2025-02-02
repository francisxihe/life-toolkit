import { SubTodo } from "../entities/sub-todo.entity";
import { SubTodoVO, CreateSubTodoVO } from "./sub-todo-vo";
import { CreateSubTodoDto, UpdateSubTodoDto } from "./sub-todo-dto";
import { TodoStatus } from "../entities/base.entity";
import dayjs from "dayjs";

export class SubTodoMapper {
  static entityToVO(entity: SubTodo | null): SubTodoVO | null {
    if (!entity) return null;
    if (!entity.name || !entity.parentId) {
      console.warn('SubTodo entity missing required fields:', entity);
      return null;
    }

    const vo = new SubTodoVO();
    vo.id = entity.id;
    vo.name = entity.name;
    vo.description = entity.description || null;
    vo.status = entity.status;
    vo.tags = entity.tags || null;
    vo.importance = entity.importance || null;
    vo.urgency = entity.urgency || null;
    vo.parentId = entity.parentId;
    vo.createdAt = entity.createdAt;
    vo.updatedAt = entity.updatedAt;
    vo.doneAt = entity.doneAt;
    vo.abandonedAt = entity.abandonedAt;

    return vo;
  }

  static entityToVOList(entities: SubTodo[] | null): SubTodoVO[] {
    if (!entities) return [];
    return entities
      .map(entity => this.entityToVO(entity))
      .filter((vo): vo is SubTodoVO => vo !== null);
  }

  static createDtoToEntity(dto: CreateSubTodoDto): Partial<SubTodo> {
    return {
      name: dto.name,
      description: dto.description,
      status: dto.status,
      tags: dto.tags,
      importance: dto.importance,
      urgency: dto.urgency,
      parentId: dto.parentId,
    };
  }

  static updateDtoToEntity(dto: UpdateSubTodoDto): Partial<SubTodo> {
    return {
      name: dto.name,
      description: dto.description,
      status: dto.status,
      tags: dto.tags,
      importance: dto.importance,
      urgency: dto.urgency,
      parentId: dto.parentId,
    };
  }

  static dtoToVO(dto: CreateSubTodoDto | UpdateSubTodoDto): SubTodoVO {
    const vo = new SubTodoVO();
    vo.name = dto.name || '';
    vo.description = dto.description || null;
    vo.status = dto.status || TodoStatus.TODO;
    vo.tags = dto.tags || null;
    vo.importance = dto.importance || null;
    vo.urgency = dto.urgency || null;
    vo.planDate = dto.planDate || '';
    vo.planTimeRange = null;
    vo.parentId = dto.parentId || '';
    return vo;
  }

  static dtoToVOList(dtos: (CreateSubTodoDto | UpdateSubTodoDto)[]): SubTodoVO[] {
    return dtos.map(dto => this.dtoToVO(dto));
  }

  static voToCreateDto(vo: CreateSubTodoVO): CreateSubTodoDto {
    const dto = new CreateSubTodoDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.status = vo.status;
    dto.tags = vo.tags;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.planDate = vo.planDate;
    dto.parentId = vo.parentId;
    return dto;
  }

  static voToUpdateDto(vo: CreateSubTodoVO): UpdateSubTodoDto {
    const dto = new UpdateSubTodoDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.status = vo.status;
    dto.tags = vo.tags;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.planDate = vo.planDate;
    dto.parentId = vo.parentId;
    return dto;
  }
} 