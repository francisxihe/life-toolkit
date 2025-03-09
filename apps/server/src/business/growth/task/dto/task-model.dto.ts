import { Task } from "../entities";
import { BaseModelDto } from "@/base/base-model.dto";
import { OmitType, IntersectionType } from "@nestjs/mapped-types";
import { GoalDto } from "../../goal/dto";
import { TrackTimeDto } from "../../track-time/dto";
import { TodoDto } from "../../todo/dto";

export class TaskDto extends IntersectionType(
  BaseModelDto,
  OmitType(Task, [
    "children",
    "parent",
    "goal",
    "trackTimeIds",
    "todoList",
  ] as const)
) {
  children?: TaskDto[];
  parent?: TaskDto;
  goal?: GoalDto;
  trackTimeList?: TrackTimeDto[];
  todoList?: TodoDto[];
}

export class TaskModelDto extends OmitType(TaskDto, [
  "children",
  "parent",
  "goal",
  "trackTimeList",
  "todoList",
] as const) {}
