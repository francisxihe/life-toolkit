import { TodoDto } from "./todo-model.dto";
import {
  PickType,
  IntersectionType,
  PartialType,
  OmitType,
} from "@life-toolkit/mapped-types";
import { Todo } from "../todo.entity";
import {
  CreateRepeatDto,
  UpdateRepeatDto,
} from "@life-toolkit/components-repeat/server";

export class CreateTodoDto extends PickType(TodoDto, [
  "name",
  "description",
  "status",
  "planDate",
  "planStartAt",
  "planEndAt",
  "importance",
  "urgency",
  "tags",
] as const) {
  taskId?: string;
  repeat?: CreateRepeatDto;

  applyToCreateEntity(entity: Todo) {
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.status !== undefined) entity.status = this.status;
    if (this.planDate !== undefined) entity.planDate = this.planDate;
    if (this.planStartAt !== undefined) entity.planStartAt = this.planStartAt;
    if (this.planEndAt !== undefined) entity.planEndAt = this.planEndAt;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.urgency !== undefined) entity.urgency = this.urgency;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.taskId !== undefined) entity.taskId = this.taskId;
  }
}

export class UpdateTodoDto extends IntersectionType(
  PartialType(OmitType(CreateTodoDto, ["repeat"] as const)),
  PickType(Todo, ["id"] as const),
  PickType(TodoDto, ["doneAt", "abandonedAt"] as const)
) {
  repeat?: UpdateRepeatDto;

  applyToUpdateEntity(entity: Todo) {
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.status !== undefined) entity.status = this.status;
    if (this.planDate !== undefined) entity.planDate = this.planDate;
    if (this.planStartAt !== undefined) entity.planStartAt = this.planStartAt;
    if (this.planEndAt !== undefined) entity.planEndAt = this.planEndAt;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.urgency !== undefined) entity.urgency = this.urgency;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.doneAt !== undefined) entity.doneAt = this.doneAt;
    if (this.abandonedAt !== undefined) entity.abandonedAt = this.abandonedAt;
    if (this.taskId !== undefined) entity.taskId = this.taskId;
  }
}
