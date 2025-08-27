import { TodoRepeatDto } from "./todo-repeat-model.dto";
import {
  PickType,
  IntersectionType,
  PartialType,
  OmitType,
} from "@life-toolkit/mapped-types";
import { TodoRepeat } from "../todo-repeat.entity";
import {
  CreateRepeatDto,
  UpdateRepeatDto,
} from "@life-toolkit/components-repeat/server";

export class CreateTodoRepeatDto extends IntersectionType(
  CreateRepeatDto,
  PickType(TodoRepeatDto, [
    "name",
    "description",
    "importance",
    "urgency",
    "tags",
    "source",
    "startAt",
    "endAt",
    "status",
  ] as const)
) {
  applyToCreateEntity(entity: TodoRepeat) {
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.urgency !== undefined) entity.urgency = this.urgency;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.source !== undefined) entity.source = this.source;
    if (this.startAt !== undefined) entity.startAt = this.startAt;
    if (this.endAt !== undefined) entity.endAt = this.endAt;
    if (this.status !== undefined) entity.status = this.status;
  }
}

export class UpdateTodoRepeatDto extends IntersectionType(
  UpdateRepeatDto,
  PartialType(OmitType(CreateTodoRepeatDto, [] as const)),
  PickType(TodoRepeat, ["id"] as const),
  PickType(TodoRepeatDto, ["doneAt", "abandonedAt"] as const)
) {
  applyToUpdateEntity(entity: TodoRepeat) {
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.urgency !== undefined) entity.urgency = this.urgency;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.source !== undefined) entity.source = this.source;
    if (this.startAt !== undefined) entity.startAt = this.startAt;
    if (this.endAt !== undefined) entity.endAt = this.endAt;
    if (this.status !== undefined) entity.status = this.status;
    if (this.doneAt !== undefined) entity.doneAt = this.doneAt;
    if (this.abandonedAt !== undefined) entity.abandonedAt = this.abandonedAt;
  }
}
