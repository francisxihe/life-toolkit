import { SubTodoDto } from ".";
import { TodoStatus, TodoRepeat, Todo } from "../entities";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsISO8601,
} from "class-validator";
import { Type } from "class-transformer";
import { BaseModelDto, BaseModelDtoKeys } from "@/base/base-model.dto";
import {
  OmitType,
  PartialType,
  IntersectionType,
  PickType,
} from "@nestjs/mapped-types";

export class TodoDto extends IntersectionType(
  BaseModelDto,
  PickType(Todo, [
    "name",
    "description",
    "status",
    "tags",
    "importance",
    "urgency",
    "planDate",
    "planStartAt",
    "planEndAt",
    "repeat",
    "repeatInterval",
    "doneAt",
    "abandonedAt",
  ] as const)
) {}

export class CreateTodoDto extends OmitType(TodoDto, [
  "status",
  "doneAt",
  "abandonedAt",
  ...BaseModelDtoKeys,
] as const) {}

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  /** 待办事项ID */
  id: string;
}

export class TodoWithSubDto extends TodoDto {
  // subTodoList: SubTodoDto[];
}
