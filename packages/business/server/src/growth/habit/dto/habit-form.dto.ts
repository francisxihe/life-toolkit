import { Habit } from "..";
import { PartialType, IntersectionType, PickType } from "@life-toolkit/mapped-types";
import { HabitDto } from "./habit-model.dto";

export class CreateHabitDto extends PickType(HabitDto, [
  "name",
  "description",
  "importance",
  "tags",
  "difficulty",
  "startDate",
  "targetDate",
] as const) {
  goalIds?: string[];
}

export class UpdateHabitDto extends IntersectionType(
  PartialType(CreateHabitDto),
  PartialType(PickType(HabitDto, [
    "status",
    "currentStreak",
    "longestStreak",
    "completedCount",
  ] as const)),
  PickType(Habit, ["id"] as const)
) {} 