import { BaseModelDto } from "@/base/base-model.dto";
import { IntersectionType, OmitType } from "@nestjs/mapped-types";
import { Todo } from "../entities/todo.entity";
import { TaskDto } from "../../task/dto/task-model.dto";
import { TodoRepeat } from "../entities/todo-repeat.entity";

export class TodoDto extends IntersectionType(
  BaseModelDto,
  OmitType(Todo, ["task", "repeat", "habit"] as const)
) {
  task?: TaskDto;
  repeat?: TodoRepeat;
  habit?: any;
}

export class TodoModelDto extends OmitType(TodoDto, ["task", "repeat", "habit"] as const) {}
