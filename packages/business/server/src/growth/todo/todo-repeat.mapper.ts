import {
  CreateTodoRepeatDto,
  UpdateTodoRepeatDto,
  TodoRepeatDto,
  TodoRepeatModelDto,
} from "./dto";
import { TodoRepeat } from "./todo-repeat.entity";
import dayjs from "dayjs";
import { BaseMapper } from "../../base/base.mapper";
import type { Todo as TodoVO } from "@life-toolkit/vo";
import type { CreateRepeatVo, UpdateRepeatVo } from "@life-toolkit/components-repeat/vo";

export class TodoRepeatMapper {
  /**
   * 实体转模型DTO（仅基础字段，不含关联，Date 保持为 Date）
   */
  static entityToModelDto(entity: TodoRepeat): TodoRepeatModelDto {
    const dto = new TodoRepeatModelDto();
    Object.assign(dto, BaseMapper.entityToDto(entity));
    // 重复配置相关字段
    dto.repeatMode = entity.repeatMode;
    dto.repeatConfig = entity.repeatConfig;
    dto.repeatEndMode = entity.repeatEndMode;
    dto.repeatEndDate = entity.repeatEndDate;
    dto.repeatTimes = entity.repeatTimes;
    dto.repeatedTimes = entity.repeatedTimes;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.importance = entity.importance;
    dto.urgency = entity.urgency;
    dto.tags = entity.tags;
    dto.repeatStartDate = entity.repeatStartDate;
    dto.currentDate = entity.currentDate;
    dto.status = entity.status;
    dto.abandonedAt = entity.abandonedAt;
    return dto;
  }

  static entityToDto(entity: TodoRepeat): TodoRepeatDto {
    const dto = new TodoRepeatDto();
    Object.assign(dto, this.entityToModelDto(entity));
    // 关联属性（浅拷贝，避免递归）
    dto.todos = entity.todos;
    return dto;
  }

  static dtoToVo(dto: TodoRepeatDto): any {
    return {
      id: dto.id,
      // 重复配置相关字段
      repeatMode: dto.repeatMode,
      repeatConfig: dto.repeatConfig,
      repeatEndMode: dto.repeatEndMode,
      repeatEndDate: dto.repeatEndDate,
      repeatTimes: dto.repeatTimes,
      repeatedTimes: dto.repeatedTimes,
      name: dto.name || "",
      description: dto.description || "",
      importance: dto.importance,
      urgency: dto.urgency,
      tags: dto.tags || [],
      repeatStartDate: dto.repeatStartDate
        ? dayjs(dto.repeatStartDate).format("YYYY-MM-DD")
        : undefined,
      currentDate: dto.currentDate
        ? dayjs(dto.currentDate).format("YYYY-MM-DD")
        : undefined,
      status: dto.status,
      abandonedAt: dto.abandonedAt
        ? dayjs(dto.abandonedAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
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

  static voToUpdateDto(
    vo: TodoVO.UpdateTodoVo & { repeat: UpdateRepeatVo }
  ): UpdateTodoRepeatDto {
    const dto = new UpdateTodoRepeatDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.tags = vo.tags;
    dto.repeatStartDate = vo.repeat.repeatStartDate;
    dto.repeatMode = vo.repeat.repeatMode;
    dto.repeatConfig = vo.repeat.repeatConfig;
    dto.repeatEndMode = vo.repeat.repeatEndMode;
    dto.repeatEndDate = vo.repeat.repeatEndDate;
    dto.repeatTimes = vo.repeat.repeatTimes;
    return dto;
  }
}
