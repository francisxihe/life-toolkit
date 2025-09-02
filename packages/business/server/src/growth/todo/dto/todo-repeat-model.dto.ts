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

  importEntity(entity: TodoRepeat) {
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
    // 关联属性（浅拷贝，避免递归）
    this.todos = entity.todos;
  }

  exportVo(): TodoVO.TodoVo {
    return this.exportModelVo();
  }

  exportModelVo(): TodoVO.TodoModelVo {
    return {
      id: this.id,
      // 重复配置相关字段
      name: this.name || "",
      description: this.description || "",
      importance: this.importance,
      urgency: this.urgency,
      tags: this.tags || [],
      status: this.status,
      abandonedAt: this.abandonedAt
        ? dayjs(this.abandonedAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      createdAt: dayjs(this.createdAt).format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: dayjs(this.updatedAt).format("YYYY-MM-DD HH:mm:ss"),

      planDate: dayjs(this.currentDate).format("YYYY-MM-DD"),

      repeat: {
        repeatStartDate: this.repeatStartDate
          ? dayjs(this.repeatStartDate).format("YYYY-MM-DD")
          : undefined,
        currentDate: dayjs(this.currentDate).format("YYYY-MM-DD"),
        repeatMode: this.repeatMode,
        repeatConfig: this.repeatConfig,
        repeatEndMode: this.repeatEndMode,
        repeatEndDate: this.repeatEndDate,
        repeatTimes: this.repeatTimes,
        repeatedTimes: this.repeatedTimes,
      },
    };
  }
}

export class TodoRepeatModelDto extends OmitType(TodoRepeatDto, [
  "todos",
] as const) {}
