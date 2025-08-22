import type { Todo as TodoVO } from "@life-toolkit/vo";
import { CreateTodoDto, UpdateTodoDto, TodoDto, TodoModelDto } from "./dto";
import { TodoStatus } from "./todo.enum";
import { Todo } from "./todo.entity";
import dayjs from "dayjs";
import { BaseMapper } from "../../base/base.mapper";
import { TaskMapper } from "../task/task.mapper";
import { RepeatMapper } from "@life-toolkit/components-repeat/server";

export class TodoMapper {
  static importEntity<T>(entity: T): Todo {
    return entity as Todo;
  }

  /**
   * 实体转模型DTO（仅基础字段，不含关联，Date 保持为 Date）
   */
  static entityToModelDto(entity: Todo): TodoModelDto {
    const dto = new TodoModelDto();
    Object.assign(dto, BaseMapper.entityToDto(entity));
    dto.name = entity.name;
    dto.description = entity.description;
    dto.status = entity.status;
    dto.tags = entity.tags;
    dto.importance = entity.importance;
    dto.urgency = entity.urgency;
    dto.planDate = entity.planDate;
    dto.repeatId = entity.repeatId;
    dto.originalRepeatId = entity.originalRepeatId;
    dto.source = entity.source;
    dto.doneAt = entity.doneAt;
    dto.abandonedAt = entity.abandonedAt;
    dto.planStartAt = entity.planStartAt;
    dto.planEndAt = entity.planEndAt;
    return dto;
  }

  static entityToDto(entity: Todo): TodoDto {
    const dto = new TodoDto();
    Object.assign(dto, this.entityToModelDto(entity));
    // 关联属性（浅拷贝，避免递归）
    dto.repeat = entity.repeat as any;
    dto.task = entity.task as any;
    return dto;
  }

  // =======

  static dtoToVo(dto: TodoDto): TodoVO.TodoVo {
    const vo: TodoVO.TodoVo = {
      ...BaseMapper.dtoToVo(dto),
      name: dto.name || "",
      description: dto.description,
      status: dto.status || TodoStatus.TODO,
      tags: dto.tags,
      importance: dto.importance,
      urgency: dto.urgency,
      planDate: dayjs(dto.planDate).format("YYYY-MM-DD"),
      planStartAt: dto.planStartAt
        ? dayjs(dto.planStartAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      planEndAt: dto.planEndAt
        ? dayjs(dto.planEndAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      repeat: dto.repeat,
      doneAt: dto.doneAt
        ? dayjs(dto.doneAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      abandonedAt: dto.abandonedAt
        ? dayjs(dto.abandonedAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      task: dto.task ? TaskMapper.dtoToVo(dto.task) : undefined,
    };
    return vo;
  }

  static dtoToVoList(dtoList: TodoDto[]): TodoVO.TodoVo[] {
    return dtoList.map((dto) => this.dtoToVo(dto));
  }

  static dtoToPageVo(
    dtoList: TodoDto[],
    total: number,
    pageNum: number,
    pageSize: number
  ): TodoVO.TodoPageVo {
    const vo = {
      list: this.dtoToVoList(dtoList),
      total,
      pageNum,
      pageSize,
    };
    return vo;
  }

  static dtoToListVo(dtoList: TodoDto[]): TodoVO.TodoListVo {
    const vo = {
      list: this.dtoToVoList(dtoList),
    };
    return vo;
  }

  // =======

  static voToCreateDto(vo: TodoVO.CreateTodoVo): CreateTodoDto {
    const dto = new CreateTodoDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.tags = vo.tags || [];
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.planDate = dayjs(vo.planDate).toDate();
    dto.repeat = vo.repeat ? RepeatMapper.voToCreateDto(vo.repeat) : undefined;
    dto.taskId = vo.taskId;
    return dto;
  }

  static voToUpdateDto(vo: TodoVO.UpdateTodoVo): UpdateTodoDto {
    const dto = new UpdateTodoDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.tags = vo.tags;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.planDate = dayjs(vo.planDate).toDate();
    dto.repeat = vo.repeat ? RepeatMapper.voToUpdateDto(vo.repeat) : undefined;
    dto.taskId = vo.taskId;
    return dto;
  }
}
