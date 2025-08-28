import { Task } from "../task.entity";
import { TaskDto } from "./task-model.dto";
import {
  IntersectionType,
  PartialType,
  PickType,
} from "@life-toolkit/mapped-types";

export class CreateTaskDto extends PickType(TaskDto, [
  "name",
  "description",
  "tags",
  "doneAt",
  "abandonedAt",
  "estimateTime",
  "importance",
  "urgency",
  "goalId",
  "startAt",
  "endAt",
] as const) {
  parentId?: string;
  trackTimeIds?: string[];

  appendToCreateEntity(entity: Task) {
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.doneAt !== undefined) entity.doneAt = this.doneAt;
    if (this.abandonedAt !== undefined) entity.abandonedAt = this.abandonedAt;
    if (this.estimateTime !== undefined) entity.estimateTime = this.estimateTime;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.urgency !== undefined) entity.urgency = this.urgency;
    if (this.goalId !== undefined) entity.goalId = this.goalId;
    if (this.startAt !== undefined) entity.startAt = this.startAt;
    if (this.endAt !== undefined) entity.endAt = this.endAt;
    if (this.trackTimeIds !== undefined) entity.trackTimeIds = this.trackTimeIds;
  }
}

export class UpdateTaskDto extends IntersectionType(
  PartialType(CreateTaskDto),
  PickType(TaskDto, ["status"] as const)
) {
  appendToUpdateEntity(entity: Task) {
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.doneAt !== undefined) entity.doneAt = this.doneAt;
    if (this.abandonedAt !== undefined) entity.abandonedAt = this.abandonedAt;
    if (this.estimateTime !== undefined)
      entity.estimateTime = this.estimateTime;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.urgency !== undefined) entity.urgency = this.urgency;
    if (this.goalId !== undefined) entity.goalId = this.goalId;
    if (this.startAt !== undefined) entity.startAt = this.startAt;
    if (this.endAt !== undefined) entity.endAt = this.endAt;
    if (this.trackTimeIds !== undefined)
      entity.trackTimeIds = this.trackTimeIds;
    if (this.status !== undefined) entity.status = this.status;
  }
}
