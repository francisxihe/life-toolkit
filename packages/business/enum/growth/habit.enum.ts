import { Difficulty } from "../base";

export enum HabitStatus {
  ACTIVE = "active", // 活跃中
  PAUSED = "paused", // 暂停
  COMPLETED = "completed", // 已完成
  ABANDONED = "abandoned", // 已放弃
}

export enum HabitDifficulty {
  GettingStarted = Difficulty.GettingStarted,
  Skilled = Difficulty.Skilled,
  Challenger = Difficulty.Challenger,
  Master = Difficulty.Master,
  Legendary = Difficulty.Legendary,
}
