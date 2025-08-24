import { BaseModelVo } from "../../base/model.vo";
import { GoalVo } from "../goal/goal-model.vo";
import { HabitStatus, HabitDifficulty } from "@life-toolkit/enum";

export enum HabitCompletionScore {
  NOT_COMPLETED = 0,
  PARTIALLY_COMPLETED = 1,
  FULLY_COMPLETED = 2,
}

export type HabitModelVo = {
  name: string;
  status: HabitStatus;
  description?: string;
  importance?: number;
  tags?: string[];
  difficulty?: HabitDifficulty;
  startAt?: string;
  targetAt?: string;
  currentStreak?: number;
  longestStreak?: number;
  completedCount?: number;
  doneAt?: string;
  abandonedAt?: string;
};

export type HabitItemVo = BaseModelVo & HabitModelVo;

export type HabitVo = HabitItemVo & {
  /** 关联的目标 */
  goals?: GoalVo[];
  /** 最近的日志记录 */
  recentLogs?: HabitLogVo[];
  /** 统计信息 */
  statistics?: HabitStatisticsVo;
};

export type HabitStatisticsVo = {
  totalDays: number;
  completedDays: number;
  completionRate: number;
  averageScore: number;
  weeklyCompletionRate: number;
  monthlyCompletionRate: number;
  bestStreak: number;
  currentStreakDays: number;
  lastCompletedAt?: string;
};

export type HabitLogVo = {
  id: string;
  habitId: string;
  logDate: string;
  completionScore: HabitCompletionScore;
  note?: string;
  mood?: number;
  createdAt: string;
  updatedAt: string;
  habit?: HabitVo;
};
