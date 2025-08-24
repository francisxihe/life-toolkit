import { Habit } from "..";
import { BaseModelDto } from "../../../base/base-model.dto";
import { OmitType, IntersectionType } from "@life-toolkit/mapped-types";

export class HabitDto extends IntersectionType(BaseModelDto, Habit) {}

export class HabitModelDto extends OmitType(HabitDto, [
  "goals",
  "todos",
] as const) {} 