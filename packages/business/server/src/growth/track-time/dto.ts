import { TrackTime } from "./entity";
import { BaseModelDto, BaseModelDtoKeys } from "../../base/base-model.dto";
import {
  OmitType,
  PartialType,
  IntersectionType,
  PickType,
} from "@life-toolkit/mapped-types";

export class TrackTimeDto extends IntersectionType(
  BaseModelDto,
  PickType(TrackTime, ["startAt", "endAt", "duration", "notes"] as const)
) {}

export class CreateTrackTimeDto extends OmitType(TrackTimeDto, [
  ...BaseModelDtoKeys,
] as const) {}

export class UpdateTrackTimeDto extends IntersectionType(
  PartialType(CreateTrackTimeDto),
  PickType(TrackTime, ["id"] as const)
) {}
