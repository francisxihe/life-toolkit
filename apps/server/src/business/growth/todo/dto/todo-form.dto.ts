import { TodoDto } from "./todo-model.dto";
import {
  PickType,
  IntersectionType,
  PartialType,
  OmitType,
} from "@nestjs/mapped-types";
import { Todo } from "../entities";
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
}

export class UpdateTodoDto extends IntersectionType(
  PartialType(OmitType(CreateTodoDto, ["repeat"] as const)),
  PickType(Todo, ["id"] as const)
) {
  repeat?: UpdateRepeatDto;
}
