import { TodoRepeatDto } from "./todo-repeat-model.dto";
import {
  PickType,
  IntersectionType,
  PartialType,
  OmitType,
} from "@life-toolkit/mapped-types";
import { TodoRepeat } from "../todo-repeat.entity";
import { TodoRepeatModelDto } from "./todo-repeat-model.dto";
import {
  CreateRepeatVo,
  UpdateRepeatVo,
} from "@life-toolkit/components-repeat/vo";
import type { Todo as TodoVO } from "@life-toolkit/vo";

export class CreateTodoRepeatDto extends IntersectionType(
  TodoRepeatModelDto,
  PickType(TodoRepeatDto, [
    "name",
    "description",
    "importance",
    "urgency",
    "tags",
    "repeatStartDate",
    "currentDate",
    "status",
  ] as const)
) {
  appendToCreateEntity(entity: TodoRepeat) {
    // 重复配置相关字段（来自 CreateRepeatDto）
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.urgency !== undefined) entity.urgency = this.urgency;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.status !== undefined) entity.status = this.status;

    if (this.repeatStartDate !== undefined)
      entity.repeatStartDate = this.repeatStartDate;
    if (this.currentDate !== undefined) entity.currentDate = this.currentDate;
    if (this.repeatMode !== undefined) entity.repeatMode = this.repeatMode;
    if (this.repeatConfig !== undefined)
      entity.repeatConfig = this.repeatConfig;
    if (this.repeatEndMode !== undefined)
      entity.repeatEndMode = this.repeatEndMode;
    if (this.repeatEndDate !== undefined)
      entity.repeatEndDate = this.repeatEndDate;
    if (this.repeatTimes !== undefined) entity.repeatTimes = this.repeatTimes;
    if (this.repeatedTimes !== undefined)
      entity.repeatedTimes = this.repeatedTimes;
  }

  voToCreateDto(vo: TodoVO.CreateTodoVo & { repeat: CreateRepeatVo }) {
    this.name = vo.name;
    this.description = vo.description;
    this.importance = vo.importance;
    this.urgency = vo.urgency;
    this.tags = vo.tags;
    this.repeatStartDate = vo.repeat.repeatStartDate;
    this.currentDate = vo.repeat.currentDate;
    this.repeatMode = vo.repeat.repeatMode;
    this.repeatConfig = vo.repeat.repeatConfig;
    this.repeatEndMode = vo.repeat.repeatEndMode;
    this.repeatEndDate = vo.repeat.repeatEndDate;
    this.repeatTimes = vo.repeat.repeatTimes;
  }
}

export class UpdateTodoRepeatDto extends IntersectionType(
  PartialType(OmitType(CreateTodoRepeatDto, [] as const)),
  PickType(TodoRepeat, ["id"] as const),
  PickType(TodoRepeatDto, ["abandonedAt"] as const)
) {
  appendToUpdateEntity(entity: TodoRepeat) {
    // 重复配置相关字段（来自 UpdateRepeatDto）
    if (this.repeatMode !== undefined) entity.repeatMode = this.repeatMode;
    if (this.repeatConfig !== undefined)
      entity.repeatConfig = this.repeatConfig;
    if (this.repeatEndMode !== undefined)
      entity.repeatEndMode = this.repeatEndMode;
    if (this.repeatEndDate !== undefined)
      entity.repeatEndDate = this.repeatEndDate;
    if (this.repeatTimes !== undefined) entity.repeatTimes = this.repeatTimes;
    if (this.repeatedTimes !== undefined)
      entity.repeatedTimes = this.repeatedTimes;
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.urgency !== undefined) entity.urgency = this.urgency;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.repeatStartDate !== undefined)
      entity.repeatStartDate = this.repeatStartDate;
    if (this.currentDate !== undefined) entity.currentDate = this.currentDate;
    if (this.status !== undefined) entity.status = this.status;
    if (this.abandonedAt !== undefined) entity.abandonedAt = this.abandonedAt;
  }

  voToUpdateDto(vo: TodoVO.UpdateTodoVo & { repeat: UpdateRepeatVo }) {
    this.name = vo.name;
    this.description = vo.description;
    this.importance = vo.importance;
    this.urgency = vo.urgency;
    this.tags = vo.tags;
    this.repeatStartDate = vo.repeat.repeatStartDate;
    this.repeatMode = vo.repeat.repeatMode;
    this.repeatConfig = vo.repeat.repeatConfig;
    this.repeatEndMode = vo.repeat.repeatEndMode;
    this.repeatEndDate = vo.repeat.repeatEndDate;
    this.repeatTimes = vo.repeat.repeatTimes;
  }
}
