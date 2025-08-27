import { BaseModelDto } from "../../../base/base-model.dto";
import { IntersectionType, OmitType } from "@life-toolkit/mapped-types";
import { TodoRepeat } from "../todo-repeat.entity";
import { Todo } from "../../todo/todo.entity";

export class TodoRepeatDto extends IntersectionType(
  BaseModelDto,
  OmitType(TodoRepeat, ["todos"] as const)
) {
  todos?: Todo[];
}

export class TodoRepeatModelDto extends OmitType(TodoRepeatDto, [
  "todos",
] as const) {}
