import { TodoDto } from "./todo-model.dto";
import {
  PickType,
  IntersectionType,
  PartialType,
  OmitType,
} from "../../../common/mapped-types";
import { Todo } from "../todo.entity";
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
  PickType(Todo, ["id"] as const),
  PickType(TodoDto, ["doneAt", "abandonedAt"] as const)
) {
  repeat?: UpdateRepeatDto;
}
