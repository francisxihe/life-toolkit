import { Task, TaskModel } from "../task.entity";
import { BaseModelDto } from "../../../base/base-model.dto";
import { OmitType, IntersectionType } from "@life-toolkit/mapped-types";
import { GoalDto } from "../../goal/dto";
import { TrackTimeDto } from "../../track-time/dto";
import { TodoDto } from "../../todo/dto";

export class TaskDto extends IntersectionType(BaseModelDto, Task) {
  children!: TaskDto[];
  parent?: TaskDto;
  goal?: GoalDto;
  trackTimeList?: TrackTimeDto[];
  todoList?: TodoDto[];
}

export class TaskModelDto extends IntersectionType(BaseModelDto, TaskModel) {}
