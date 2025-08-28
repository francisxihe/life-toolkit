import { Task } from "../task.entity";
import { TaskDto } from "./task-model.dto";
import {
  IntersectionType,
  PartialType,
  PickType,
  OmitType,
} from "@life-toolkit/mapped-types";
import {
  IsOptional,
  IsArray,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";
import { TaskStatus } from "@life-toolkit/enum";

export class CreateTaskDto extends PickType(TaskDto, [
  "name",
  "description",
  "tags",
  "estimateTime",
  "importance",
  "urgency",
  "goalId",
  "startAt",
  "endAt",
] as const) {
  /** 父任务ID */
  @IsString()
  @IsOptional()
  parentId?: string;

  /** 跟踪时间ID列表 */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  trackTimeIds?: string[];

  appendToCreateEntity(entity: Task) {
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.tags !== undefined) entity.tags = this.tags;
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
  PartialType(OmitType(CreateTaskDto, ["trackTimeIds"] as const)),
  PickType(Task, ["id"] as const),
  PickType(TaskDto, ["status", "doneAt", "abandonedAt"] as const)
) {
  appendToUpdateEntity(entity: Task) {
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.estimateTime !== undefined) entity.estimateTime = this.estimateTime;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.urgency !== undefined) entity.urgency = this.urgency;
    if (this.goalId !== undefined) entity.goalId = this.goalId;
    if (this.startAt !== undefined) entity.startAt = this.startAt;
    if (this.endAt !== undefined) entity.endAt = this.endAt;
    if (this.status !== undefined) entity.status = this.status;
    if (this.doneAt !== undefined) entity.doneAt = this.doneAt;
    if (this.abandonedAt !== undefined) entity.abandonedAt = this.abandonedAt;
  }
}
