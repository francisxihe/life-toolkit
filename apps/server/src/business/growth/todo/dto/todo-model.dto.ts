import { BaseModelDto } from "@/base/base-model.dto";
import { IntersectionType, OmitType } from "@nestjs/mapped-types";
import { Todo } from "../entities/todo.entity";
import { TaskDto } from "../../task/dto/task-model.dto";

export class TodoDto extends IntersectionType(
  BaseModelDto,
  OmitType(Todo, ["task"] as const)
) {
  task?: TaskDto;
}

export class TodoModelDto extends OmitType(TodoDto, ["task"] as const) {}
