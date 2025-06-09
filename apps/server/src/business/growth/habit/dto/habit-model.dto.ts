import { Habit } from "../entities";
import { BaseModelDto } from "@/base/base-model.dto";
import { OmitType, IntersectionType } from "@nestjs/mapped-types";

export class HabitDto extends IntersectionType(BaseModelDto, Habit) {}

export class HabitModelDto extends OmitType(HabitDto, [
  "goals",
  "todos",
] as const) {} 