import { BaseModelDto } from "../../../base/base-model.dto";
import { IntersectionType, OmitType } from "@life-toolkit/mapped-types";
import { Todo } from "../todo.entity";
import { TaskDto } from "../../task";
import { BaseMapper } from "../../../base/base.mapper";
import { Todo as TodoVO } from "@life-toolkit/vo";
import dayjs from "dayjs";
import { TodoStatus } from "@life-toolkit/enum";
import { TaskMapper } from "../../task/task.mapper";

export class TodoDto extends IntersectionType(
  BaseModelDto,
  OmitType(Todo, ["task", "repeat", "habit"] as const)
) {
  task?: TaskDto;
  habit?: any;

  importEntity(entity: Todo) {
    Object.assign(this, BaseMapper.entityToDto(entity));
    this.name = entity.name;
    this.description = entity.description;
    this.status = entity.status;
    this.tags = entity.tags;
    this.importance = entity.importance;
    this.urgency = entity.urgency;
    this.planDate = entity.planDate;
    this.repeatId = entity.repeatId;
    this.originalRepeatId = entity.originalRepeatId;
    this.source = entity.source;
    this.doneAt = entity.doneAt;
    this.abandonedAt = entity.abandonedAt;
    this.planStartAt = entity.planStartAt;
    this.planEndAt = entity.planEndAt;
    // 关联属性（浅拷贝，避免递归）
    this.task = entity.task ? TaskMapper.entityToDto(entity.task) : undefined;
  }

  exportModelVo(): TodoVO.TodoVo {
    return {
      ...BaseMapper.dtoToVo(this),
      name: this.name || "",
      description: this.description,
      status: this.status ?? TodoStatus.TODO,
      tags: this.tags,
      importance: this.importance,
      urgency: this.urgency,
      planDate: dayjs(this.planDate).format("YYYY-MM-DD"),
      planStartAt: this.planStartAt
        ? dayjs(this.planStartAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      planEndAt: this.planEndAt
        ? dayjs(this.planEndAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      doneAt: this.doneAt
        ? dayjs(this.doneAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      abandonedAt: this.abandonedAt
        ? dayjs(this.abandonedAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      task: this.task ? TaskMapper.dtoToVo(this.task) : undefined,
    };
  }

  exportVo(): TodoVO.TodoItemVo {
    return this.exportModelVo();
  }
}