import { BaseModelDto, BaseModelDtoKeys } from "@/base/base-model.dto";
import { OmitType, IntersectionType, PickType } from "@nestjs/mapped-types";
import { SubTodo } from "../entities";

export class SubTodoDto extends IntersectionType(
  BaseModelDto,
  PickType(SubTodo, [
    "name",
    "description",
    "status",
    "tags",
    "importance",
    "urgency",
    "planStartAt",
    "planEndAt",
    "doneAt",
    "abandonedAt",
    "parentId",
  ] as const)
) {}

export class CreateSubTodoDto extends OmitType(SubTodoDto, [
  "status",
  "doneAt",
  "abandonedAt",
  ...BaseModelDtoKeys,
] as const) {}

export class UpdateSubTodoDto extends OmitType(SubTodoDto, [
  "doneAt",
  "abandonedAt",
  ...BaseModelDtoKeys.filter((key) => key !== "id"),
] as const) {}

export class SubTodoWithSubDto extends SubTodoDto {
  // subTodoList: SubTodoDto[];
}
