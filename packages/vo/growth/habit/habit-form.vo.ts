import { HabitModelVo, HabitCompletionScore } from "./habit-model.vo";

export type CreateHabitVo = Omit<
  HabitModelVo,
  "status" | "currentStreak" | "longestStreak" | "completedCount" | "doneAt" | "abandonedAt"
> & {
  goalIds?: string[];
};

export type UpdateHabitVo = Partial<CreateHabitVo> & {
  status?: HabitModelVo["status"];
};

export type CreateHabitLogVo = {
  habitId: string;
  logDate: string;
  completionScore?: HabitCompletionScore;
  note?: string;
  mood?: number;
};

export type UpdateHabitLogVo = Partial<Omit<CreateHabitLogVo, "habitId" | "logDate">>; 