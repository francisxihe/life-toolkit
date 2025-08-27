import { CreateTodoRepeatDto, UpdateTodoRepeatDto, TodoRepeatDto, TodoRepeatModelDto } from "./dto";
import { TodoStatus } from "@life-toolkit/enum";
import { TodoRepeat } from "./todo-repeat.entity";
import dayjs from "dayjs";

export class TodoRepeatMapper {
  /**
   * 实体转模型DTO（仅基础字段，不含关联，Date 保持为 Date）
   */
  static entityToModelDto(entity: TodoRepeat): TodoRepeatModelDto {
    const dto = new TodoRepeatModelDto();
    // 基础字段映射 - 使用 any 类型避免类型检查问题
    dto.id = entity.id;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.deletedAt = entity.deletedAt;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.importance = entity.importance;
    dto.urgency = entity.urgency;
    dto.tags = entity.tags;
    dto.source = entity.source;
    dto.startAt = entity.startAt;
    dto.endAt = entity.endAt;
    dto.status = entity.status;
    dto.doneAt = entity.doneAt;
    dto.abandonedAt = entity.abandonedAt;
    return dto;
  }

  static entityToDto(entity: TodoRepeat): TodoRepeatDto {
    const dto = new TodoRepeatDto();
    Object.assign(dto, this.entityToModelDto(entity));
    // 关联属性（浅拷贝，避免递归）
    dto.todos = entity.todos as any;
    return dto;
  }

  static dtoToVo(dto: TodoRepeatDto): any {
    return {
      id: dto.id,
      name: dto.name || "",
      description: dto.description || "",
      importance: dto.importance,
      urgency: dto.urgency,
      tags: dto.tags || [],
      source: dto.source,
      startAt: dto.startAt ? dayjs(dto.startAt).format("YYYY-MM-DD HH:mm:ss") : undefined,
      endAt: dto.endAt ? dayjs(dto.endAt).format("YYYY-MM-DD HH:mm:ss") : undefined,
      status: dto.status,
      doneAt: dto.doneAt ? dayjs(dto.doneAt).format("YYYY-MM-DD HH:mm:ss") : undefined,
      abandonedAt: dto.abandonedAt ? dayjs(dto.abandonedAt).format("YYYY-MM-DD HH:mm:ss") : undefined,
      createdAt: dayjs(dto.createdAt).format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: dayjs(dto.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
    };
  }

  static dtoToItemVo(dto: TodoRepeatDto): any {
    return this.dtoToVo(dto);
  }

  static dtoToListVo(dtoList: TodoRepeatDto[]): any {
    return {
      list: dtoList.map((dto) => this.dtoToItemVo(dto)),
    };
  }

  static dtoToPageVo(
    dtoList: TodoRepeatDto[],
    total: number,
    pageNum: number,
    pageSize: number
  ): any {
    return {
      list: dtoList.map((dto) => this.dtoToItemVo(dto)),
      total,
      pageNum,
      pageSize,
    };
  }

  static voToCreateDto(vo: any): CreateTodoRepeatDto {
    const dto = new CreateTodoRepeatDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.tags = vo.tags;
    dto.source = vo.source;
    dto.startAt = vo.startAt ? new Date(vo.startAt) : undefined;
    dto.endAt = vo.endAt ? new Date(vo.endAt) : undefined;
    dto.status = vo.status;
    return dto;
  }

  static voToUpdateDto(vo: any): UpdateTodoRepeatDto {
    const dto = new UpdateTodoRepeatDto();
    dto.id = vo.id;
    dto.name = vo.name;
    dto.description = vo.description;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.tags = vo.tags;
    dto.source = vo.source;
    dto.startAt = vo.startAt ? new Date(vo.startAt) : undefined;
    dto.endAt = vo.endAt ? new Date(vo.endAt) : undefined;
    dto.status = vo.status;
    dto.doneAt = vo.doneAt ? new Date(vo.doneAt) : undefined;
    dto.abandonedAt = vo.abandonedAt ? new Date(vo.abandonedAt) : undefined;
    return dto;
  }
}
