import { Task } from "../task.entity";
import { TaskDto } from "./task-model.dto";
import { IntersectionType, PartialType, PickType } from "@life-toolkit/mapped-types";

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
}

export class UpdateTaskDto extends IntersectionType(
  PartialType(CreateTaskDto),
  PickType(Task, ["id"] as const)
) {}
