// 习惯相关的通用类型定义

// 时间周期类型
export type TimePeriod = "day" | "week" | "month" | "quarter" | "year";

// 统计时间范围
export type DateRange = {
  from: Date;
  to: Date;
};

// 习惯完成状态统计
export type HabitCompletionStats = {
  total: number;
  completed: number;
  partiallyCompleted: number;
  notCompleted: number;
  completionRate: number;
};

// 习惯连续性统计
export type HabitStreakStats = {
  current: number;
  longest: number;
  average: number;
  streaks: {
    start: Date;
    end: Date;
    length: number;
  }[];
};

// 习惯情绪统计
export type HabitMoodStats = {
  average: number;
  distribution: {
    mood: number;
    count: number;
    percentage: number;
  }[];
  trend: "improving" | "declining" | "stable";
};

// 习惯时间分布
export type HabitTimeDistribution = {
  hourly: { hour: number; count: number }[];
  daily: { dayOfWeek: number; count: number }[];
  monthly: { month: number; count: number }[];
};

// 习惯标签统计
export type HabitTagStats = {
  tag: string;
  count: number;
  completionRate: number;
  averageStreak: number;
};

// 习惯难度分析
export type HabitDifficultyAnalysis = {
  difficulty: string;
  habitCount: number;
  averageCompletionRate: number;
  averageStreak: number;
  successRate: number; // 成功建立习惯的比例
};

// 习惯目标关联统计
export type HabitGoalStats = {
  goalId: string;
  goalTitle: string;
  habitCount: number;
  averageCompletionRate: number;
  contributionScore: number; // 对目标的贡献度评分
};

// 习惯提醒效果统计
export type HabitReminderEffectiveness = {
  withReminder: HabitCompletionStats;
  withoutReminder: HabitCompletionStats;
  improvement: number; // 提醒带来的改进百分比
};

// 习惯建议类型
export type HabitSuggestion = {
  type: "frequency" | "difficulty" | "reminder" | "goal" | "tag";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actionable: boolean;
  estimatedImpact: number; // 预估影响分数 (1-10)
};

// 习惯健康度评估
export type HabitHealthScore = {
  overall: number; // 总体健康度 (0-100)
  consistency: number; // 一致性分数
  progress: number; // 进步分数
  engagement: number; // 参与度分数
  balance: number; // 平衡度分数（不同类型习惯的平衡）
  suggestions: HabitSuggestion[];
};

// 习惯挑战类型
export type HabitChallenge = {
  id: string;
  title: string;
  description: string;
  duration: number; // 挑战天数
  difficulty: "easy" | "medium" | "hard";
  rules: string[];
  rewards: string[];
  participants: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
};

// 习惯成就类型
export type HabitAchievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "streak" | "completion" | "consistency" | "milestone" | "special";
  requirement: {
    type: string;
    value: number;
    period?: TimePeriod;
  };
  unlockedAt?: Date;
  progress: number; // 当前进度 (0-1)
};

// 习惯社交分享类型
export type HabitShare = {
  habitId: string;
  habitName: string;
  achievement: string;
  message: string;
  privacy: "public" | "friends" | "private";
  platforms: ("wechat" | "weibo" | "twitter" | "facebook")[];
};

// 习惯备份恢复类型
export type HabitBackup = {
  version: string;
  exportDate: Date;
  habits: any[]; // 习惯数据
  logs: any[]; // 日志数据
  statistics: any[]; // 统计数据
  settings: any; // 用户设置
};

// 习惯模板类型
export type HabitTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  frequency: string;
  tags: string[];
  estimatedDuration: number; // 预估建立时间（天）
  successRate: number; // 成功率
  tips: string[];
  isPopular: boolean;
  usageCount: number;
};

// 习惯分析报告类型
export type HabitAnalysisReport = {
  period: DateRange;
  summary: {
    totalHabits: number;
    activeHabits: number;
    completedHabits: number;
    averageCompletionRate: number;
    totalStreak: number;
  };
  trends: {
    completionTrend: { date: Date; rate: number }[];
    streakTrend: { date: Date; streak: number }[];
    moodTrend: { date: Date; mood: number }[];
  };
  insights: {
    bestPerformingHabits: string[];
    strugglingHabits: string[];
    optimalTimes: string[];
    recommendations: HabitSuggestion[];
  };
  comparisons: {
    previousPeriod: {
      completionRateChange: number;
      streakChange: number;
      habitCountChange: number;
    };
  };
}; 