import { IntersectionType, OmitType, PickType } from "@nestjs/mapped-types";
import { Repeat } from "./entity";

export class RepeatDto extends IntersectionType(Repeat) {}

export class RepeatModelDto extends OmitType(RepeatDto, ["id"] as const) {}

export class CreateRepeatDto extends IntersectionType(RepeatModelDto) {}

export class UpdateRepeatDto extends IntersectionType(
  RepeatModelDto,
  PickType(Repeat, ["id"] as const)
) {}
