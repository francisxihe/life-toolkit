import { TodoDto } from "./todo-model.dto";
import { PickType, IntersectionType, PartialType } from "@nestjs/mapped-types";
import { Todo } from "../entities";

export class CreateTodoDto extends PickType(TodoDto, [
  "name",
  "description",
  "status",
  "planDate",
  "planStartAt",
  "planEndAt",
  "importance",
  "urgency",
  "repeat",
  "repeatInterval",
  "tags",
] as const) {
  taskId?: string;
}

export class UpdateTodoDto extends IntersectionType(
  PartialType(CreateTodoDto),
  PickType(Todo, ["id"] as const)
) {}
