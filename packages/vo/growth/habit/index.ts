export enum HabitStatus {
  ACTIVE = "active",      // 活跃中
  PAUSED = "paused",      // 暂停
  COMPLETED = "completed", // 已完成
  ABANDONED = "abandoned", // 已放弃
}

export enum HabitFrequency {
  DAILY = "daily",        // 每天
  WEEKLY = "weekly",      // 每周
  MONTHLY = "monthly",    // 每月
  CUSTOM = "custom",      // 自定义
}

export enum HabitDifficulty {
  EASY = "easy",          // 容易
  MEDIUM = "medium",      // 中等
  HARD = "hard",          // 困难
}

// 创建习惯的VO
export type CreateHabitVo = {
  name: string;
  description?: string;
  importance?: number;
  tags?: string[];
  frequency?: HabitFrequency;
  customFrequency?: string;
  difficulty?: HabitDifficulty;
  startDate?: Date;
  targetDate?: Date;
  needReminder?: boolean;
  reminderTime?: string;
}

// 更新习惯的VO
export type UpdateHabitVo = Partial<CreateHabitVo> & {
  status?: HabitStatus;
}

// 习惯VO
export type HabitVo = {
  id: string;
  name: string;
  status: HabitStatus;
  description?: string;
  importance?: number;
  tags: string[];
  frequency: HabitFrequency;
  customFrequency?: string;
  difficulty: HabitDifficulty;
  startDate: Date;
  targetDate?: Date;
  currentStreak: number;
  longestStreak: number;
  needReminder: boolean;
  reminderTime?: string;
  completedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// 创建习惯日志的VO
export type CreateHabitLogVo = {
  habitId: string;
  logDate: Date;
  completionScore?: number;
  note?: string;
  mood?: number;
}

// 更新习惯日志的VO
export type UpdateHabitLogVo = {
  completionScore?: number;
  note?: string;
  mood?: number;
}

// 习惯日志VO
export type HabitLogVo = {
  id: string;
  habitId: string;
  logDate: Date;
  completionScore: number;
  note?: string;
  mood?: number;
  createdAt: Date;
  updatedAt: Date;
} 