import { BaseModelDto } from "../../../base/base-model.dto";
import { IntersectionType, OmitType } from "@life-toolkit/mapped-types";
import { Todo } from "../todo.entity";
import { TaskDto } from "../../task";
import { TodoRepeat } from "../../todo-repeat";

export class TodoDto extends IntersectionType(
  BaseModelDto,
  OmitType(Todo, ["task", "repeat", "habit"] as const)
) {
  task?: TaskDto;
  repeat?: TodoRepeat;
  habit?: any;
}

export class TodoModelDto extends OmitType(TodoDto, [
  "task",
  "repeat",
  "habit",
] as const) {}
