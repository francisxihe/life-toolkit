import { BaseModelVo } from "../../common/model.vo";
import { GoalVo } from "../goal/goal-model.vo";
import { HabitStatus, Difficulty, Importance } from "@life-toolkit/enum";
import { TodoVo } from "../todo/todo-model.vo";

export enum HabitCompletionScore {
  NOT_COMPLETED = 0,
  PARTIALLY_COMPLETED = 1,
  FULLY_COMPLETED = 2,
}

export type HabitModelVo = {
  name: string;
  status: HabitStatus;
  description?: string;
  importance?: Importance;
  tags?: string[];
  difficulty?: Difficulty;
  startAt?: string;
  endAt?: string;
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
  /** 关联的待办事项 */
  todos?: TodoVo[];
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
