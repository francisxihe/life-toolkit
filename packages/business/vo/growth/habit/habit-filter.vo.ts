export * from "./habit-model.vo";
import { HabitVo, HabitItemVo, HabitCompletionScore } from "./habit-model.vo";
import { self } from "../../base";
import { HabitStatus, Difficulty } from "@life-toolkit/enum";

export type HabitListFiltersVo = Partial<
  Pick<HabitVo, "status" | "difficulty" | "importance" | "tags"> & {
    keyword?: string;
    statusList?: HabitStatus[];
    difficultyList?: Difficulty[];
    importanceMin?: number;
    importanceMax?: number;
    startDateStart?: string;
    startDateEnd?: string;
    endDataStart?: string;
    endDataEnd?: string;
    goalIds?: string[];
  } & self
>;

export type HabitPageFiltersVo = HabitListFiltersVo & {
  pageNum?: number;
  pageSize?: number;
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "name"
    | "importance"
    | "currentStreak"
    | "longestStreak"
    | "completedCount";
  sortOrder?: "ASC" | "DESC";
};

export type HabitListVo = {
  list: HabitItemVo[];
};

export type HabitPageVo = {
  list: HabitItemVo[];
  total: number;
  pageNum: number;
  pageSize: number;
};

export type HabitLogListFiltersVo = Partial<
  {
    habitId?: string;
    habitIds?: string[];
    logDateFrom?: string;
    logDateTo?: string;
    completionScoreList?: HabitCompletionScore[];
    moodMin?: number;
    moodMax?: number;
    hasNote?: boolean;
  } & self
>;

export type HabitLogPageFiltersVo = HabitLogListFiltersVo & {
  pageNum?: number;
  pageSize?: number;
  sortBy?: "logDate" | "completionScore" | "mood" | "createdAt";
  sortOrder?: "ASC" | "DESC";
};

export type HabitLogListVo = {
  list: HabitItemVo[];
};

export type HabitLogPageVo = {
  list: HabitItemVo[];
  total: number;
  pageNum: number;
  pageSize: number;
};
