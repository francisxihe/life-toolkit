import { BaseModelDto } from "../../../base/base-model.dto";
import { IntersectionType, OmitType } from "@life-toolkit/mapped-types";
import { TodoRepeat } from "../todo-repeat.entity";
import { Todo } from "../../todo/todo.entity";
import type { Todo as TodoVO } from "@life-toolkit/vo";
import dayjs from "dayjs";
import { BaseMapper } from "../../../base/base.mapper";

export class TodoRepeatDto extends IntersectionType(
  BaseModelDto,
  OmitType(TodoRepeat, ["todos"] as const)
) {
  todos?: Todo[];
  /**
   * 实体转模型DTO（仅基础字段，不含关联，Date 保持为 Date）
   */
  entityToModelDto(entity: TodoRepeat) {
    Object.assign(this, BaseMapper.entityToDto(entity));
    // 重复配置相关字段
    this.repeatMode = entity.repeatMode;
    this.repeatConfig = entity.repeatConfig;
    this.repeatEndMode = entity.repeatEndMode;
    this.repeatEndDate = entity.repeatEndDate;
    this.repeatTimes = entity.repeatTimes;
    this.repeatedTimes = entity.repeatedTimes;
    this.name = entity.name;
    this.description = entity.description;
    this.importance = entity.importance;
    this.urgency = entity.urgency;
    this.tags = entity.tags;
    this.repeatStartDate = entity.repeatStartDate;
    this.currentDate = entity.currentDate;
    this.status = entity.status;
    this.abandonedAt = entity.abandonedAt;
  }

  entityToDto(entity: TodoRepeat) {
    Object.assign(this, this.entityToModelDto(entity));
    // 关联属性（浅拷贝，避免递归）
    this.todos = entity.todos;
  }

  dtoToVo(dto: TodoRepeatDto): TodoVO.TodoVo {
    return {
      id: dto.id,
      // 重复配置相关字段
      name: dto.name || "",
      description: dto.description || "",
      importance: dto.importance,
      urgency: dto.urgency,
      tags: dto.tags || [],
      status: dto.status,
      abandonedAt: dto.abandonedAt
        ? dayjs(dto.abandonedAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      createdAt: dayjs(dto.createdAt).format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: dayjs(dto.updatedAt).format("YYYY-MM-DD HH:mm:ss"),

      planDate: dayjs(dto.currentDate).format("YYYY-MM-DD"),

      repeat: {
        repeatStartDate: dto.repeatStartDate
          ? dayjs(dto.repeatStartDate).format("YYYY-MM-DD")
          : undefined,
        currentDate: dayjs(dto.currentDate).format("YYYY-MM-DD"),
        repeatMode: dto.repeatMode,
        repeatConfig: dto.repeatConfig,
        repeatEndMode: dto.repeatEndMode,
        repeatEndDate: dto.repeatEndDate,
        repeatTimes: dto.repeatTimes,
        repeatedTimes: dto.repeatedTimes,
      },
    };
  }

  dtoToItemVo(dto: TodoRepeatDto): TodoVO.TodoItemVo {
    return this.dtoToVo(dto);
  }

  dtoToListVo(dtoList: TodoRepeatDto[]): TodoVO.TodoListVo {
    return {
      list: dtoList.map((dto) => this.dtoToItemVo(dto)),
    };
  }

  dtoToPageVo(
    dtoList: TodoRepeatDto[],
    total: number,
    pageNum: number,
    pageSize: number
  ): TodoVO.TodoPageVo {
    return {
      list: dtoList.map((dto) => this.dtoToItemVo(dto)),
      total,
      pageNum,
      pageSize,
    };
  }
}

export class TodoRepeatModelDto extends OmitType(TodoRepeatDto, [
  "todos",
] as const) {}
