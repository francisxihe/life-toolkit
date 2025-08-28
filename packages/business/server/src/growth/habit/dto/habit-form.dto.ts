import {
  PartialType,
  IntersectionType,
  PickType,
} from "@life-toolkit/mapped-types";
import { HabitDto } from "./habit-model.dto";
import { Habit } from "../habit.entity";

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

  appendToCreateEntity(entity: Habit) {
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.difficulty !== undefined) entity.difficulty = this.difficulty;
    if (this.startDate !== undefined) entity.startDate = this.startDate;
    if (this.targetDate !== undefined) entity.targetDate = this.targetDate;
  }
}

export class UpdateHabitDto extends IntersectionType(
  PartialType(CreateHabitDto),
  PartialType(
    PickType(HabitDto, [
      "status",
      "currentStreak",
      "longestStreak",
      "completedCount",
    ] as const)
  )
) {
  appendToUpdateEntity(entity: Habit) {
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.difficulty !== undefined) entity.difficulty = this.difficulty;
    if (this.startDate !== undefined) entity.startDate = this.startDate;
    if (this.targetDate !== undefined) entity.targetDate = this.targetDate;
    if (this.status !== undefined) entity.status = this.status;
    if (this.currentStreak !== undefined)
      entity.currentStreak = this.currentStreak;
    if (this.longestStreak !== undefined)
      entity.longestStreak = this.longestStreak;
    if (this.completedCount !== undefined)
      entity.completedCount = this.completedCount;
  }
}
