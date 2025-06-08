export enum HabitStatus {
  ACTIVE = "active", // 活跃中
  PAUSED = "paused", // 暂停
  COMPLETED = "completed", // 已完成
  ABANDONED = "abandoned", // 已放弃
}

export enum HabitFrequency {
  DAILY = "daily", // 每天
  WEEKLY = "weekly", // 每周
  MONTHLY = "monthly", // 每月
  CUSTOM = "custom", // 自定义
}

export enum HabitDifficulty {
  EASY = "easy", // 容易
  MEDIUM = "medium", // 中等
  HARD = "hard", // 困难
}

export enum HabitCompletionScore {
  NOT_COMPLETED = 0, // 未完成
  PARTIALLY_COMPLETED = 1, // 部分完成
  FULLY_COMPLETED = 2, // 完全完成
}

export enum HabitSortBy {
  CREATED_AT = "createdAt", // 创建时间
  UPDATED_AT = "updatedAt", // 更新时间
  NAME = "name", // 名称
  IMPORTANCE = "importance", // 重要程度
  CURRENT_STREAK = "currentStreak", // 当前连续天数
  LONGEST_STREAK = "longestStreak", // 最长连续天数
  COMPLETED_COUNT = "completedCount", // 完成次数
}

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
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
  goalIds?: string[]; // 关联的目标ID列表
  autoCreateTodo?: boolean; // 是否自动创建待办任务
};

// 更新习惯的VO
export type UpdateHabitVo = Partial<CreateHabitVo> & {
  status?: HabitStatus;
  currentStreak?: number;
  longestStreak?: number;
  completedCount?: number;
};

// 习惯VO
export type HabitVo = {
  id: string;
  name: string;
  status: HabitStatus;
  description?: string;
  importance: number;
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
  autoCreateTodo: boolean;
  createdAt: Date;
  updatedAt: Date;
  // 关联数据
  goals?: GoalVo[]; // 关联的目标
  recentLogs?: HabitLogVo[]; // 最近的日志记录
  // 统计信息
  statistics?: HabitStatisticsVo;
};

// 习惯统计信息VO
export type HabitStatisticsVo = {
  totalDays: number; // 总天数（从开始日期到现在）
  completedDays: number; // 已完成天数
  completionRate: number; // 完成率 (0-1)
  averageScore: number; // 平均完成分数
  weeklyCompletionRate: number; // 本周完成率
  monthlyCompletionRate: number; // 本月完成率
  bestStreak: number; // 最佳连续记录
  currentStreakDays: number; // 当前连续天数
  lastCompletedDate?: Date; // 最后完成日期
  nextReminderTime?: Date; // 下次提醒时间
};

// 习惯查询过滤VO
export type HabitFilterVo = {
  keyword?: string; // 关键词搜索（名称、描述）
  status?: HabitStatus[]; // 状态过滤
  frequency?: HabitFrequency[]; // 频率过滤
  difficulty?: HabitDifficulty[]; // 难度过滤
  tags?: string[]; // 标签过滤
  importanceMin?: number; // 最小重要程度
  importanceMax?: number; // 最大重要程度
  startDateFrom?: Date; // 开始日期范围-从
  startDateTo?: Date; // 开始日期范围-到
  hasReminder?: boolean; // 是否有提醒
  goalIds?: string[]; // 关联目标ID过滤
};

// 习惯分页查询VO
export type HabitPageFilterVo = HabitFilterVo & {
  page?: number; // 页码，从1开始
  pageSize?: number; // 每页大小
  sortBy?: HabitSortBy; // 排序字段
  sortOrder?: SortOrder; // 排序方向
};

// 习惯分页结果VO
export type HabitPageVo = {
  items: HabitVo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// 创建习惯日志的VO
export type CreateHabitLogVo = {
  habitId: string;
  logDate: Date;
  completionScore?: HabitCompletionScore;
  note?: string;
  mood?: number; // 1-5，5最佳
};

// 更新习惯日志的VO
export type UpdateHabitLogVo = {
  completionScore?: HabitCompletionScore;
  note?: string;
  mood?: number;
};

// 习惯日志VO
export type HabitLogVo = {
  id: string;
  habitId: string;
  logDate: Date;
  completionScore: HabitCompletionScore;
  note?: string;
  mood?: number;
  createdAt: Date;
  updatedAt: Date;
  // 关联数据
  habit?: HabitVo;
};

// 习惯日志查询过滤VO
export type HabitLogFilterVo = {
  habitId?: string;
  habitIds?: string[]; // 多个习惯ID
  logDateFrom?: Date; // 日期范围-从
  logDateTo?: Date; // 日期范围-到
  completionScore?: HabitCompletionScore[]; // 完成分数过滤
  moodMin?: number; // 最小情绪值
  moodMax?: number; // 最大情绪值
  hasNote?: boolean; // 是否有笔记
};

// 习惯日志分页查询VO
export type HabitLogPageFilterVo = HabitLogFilterVo & {
  page?: number;
  pageSize?: number;
  sortBy?: "logDate" | "completionScore" | "mood" | "createdAt";
  sortOrder?: SortOrder;
};

// 习惯日志分页结果VO
export type HabitLogPageVo = {
  items: HabitLogVo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// 习惯批量操作VO
export type HabitBatchOperationVo = {
  habitIds: string[];
  operation: "delete" | "pause" | "resume" | "complete" | "abandon";
  reason?: string; // 操作原因
};

// 习惯导入VO
export type HabitImportVo = {
  habits: Omit<CreateHabitVo, "goalIds">[];
  overwriteExisting?: boolean; // 是否覆盖已存在的习惯
};

// 习惯导出VO
export type HabitExportVo = {
  habitIds?: string[]; // 指定导出的习惯ID，不传则导出全部
  includeStatistics?: boolean; // 是否包含统计信息
  includeLogs?: boolean; // 是否包含日志记录
  dateRange?: {
    from: Date;
    to: Date;
  }; // 日志导出日期范围
};

// 习惯提醒VO
export type HabitReminderVo = {
  id: string;
  habitId: string;
  habitName: string;
  reminderTime: string;
  isActive: boolean;
  nextReminderAt: Date;
};

// 习惯趋势分析VO
export type HabitTrendVo = {
  habitId: string;
  habitName: string;
  period: "week" | "month" | "quarter" | "year";
  data: {
    date: Date;
    completionRate: number;
    averageScore: number;
    streak: number;
  }[];
  summary: {
    totalDays: number;
    completedDays: number;
    averageCompletionRate: number;
    bestStreak: number;
    improvement: number; // 相比上个周期的改进百分比
  };
};

// 习惯对比分析VO
export type HabitComparisonVo = {
  habits: {
    id: string;
    name: string;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
    averageScore: number;
    totalCompleted: number;
  }[];
  period: {
    from: Date;
    to: Date;
  };
};

// 目标VO（简化版，用于关联）
export type GoalVo = {
  id: string;
  title: string;
  status: string;
  priority: number;
  targetDate?: Date;
};

// 导出通用类型定义
export * from "./types";

// 导出常量定义
export * from "./constants";

// 导出工具函数
export * from "./utils";
