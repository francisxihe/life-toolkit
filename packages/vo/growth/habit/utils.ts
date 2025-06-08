// 习惯相关工具函数

import { 
  HabitStatus, 
  HabitFrequency, 
  HabitDifficulty, 
  HabitCompletionScore,
  HabitVo,
  HabitLogVo,
  HabitStatisticsVo,
  TimePeriod,
  DateRange
} from "./index";
import { 
  HABIT_DEFAULTS, 
  HABIT_STATISTICS, 
  HABIT_VALIDATION 
} from "./constants";

/**
 * 计算习惯完成率
 * @param completedDays 完成天数
 * @param totalDays 总天数
 * @returns 完成率 (0-1)
 */
export function calculateCompletionRate(completedDays: number, totalDays: number): number {
  if (totalDays === 0) return 0;
  return Math.min(completedDays / totalDays, 1);
}

/**
 * 计算习惯连续天数
 * @param logs 习惯日志列表（按日期倒序）
 * @returns 当前连续天数
 */
export function calculateCurrentStreak(logs: HabitLogVo[]): number {
  if (!logs || logs.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 按日期倒序排列
  const sortedLogs = logs.sort((a, b) => 
    new Date(b.logDate).getTime() - new Date(a.logDate).getTime()
  );
  
  for (let i = 0; i < sortedLogs.length; i++) {
    const logDate = new Date(sortedLogs[i].logDate);
    logDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    
    // 如果日期匹配且完成了
    if (logDate.getTime() === expectedDate.getTime() && 
        sortedLogs[i].completionScore > HabitCompletionScore.NOT_COMPLETED) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * 计算最长连续天数
 * @param logs 习惯日志列表
 * @returns 最长连续天数
 */
export function calculateLongestStreak(logs: HabitLogVo[]): number {
  if (!logs || logs.length === 0) return 0;
  
  const sortedLogs = logs.sort((a, b) => 
    new Date(a.logDate).getTime() - new Date(b.logDate).getTime()
  );
  
  let maxStreak = 0;
  let currentStreak = 0;
  let lastDate: Date | null = null;
  
  for (const log of sortedLogs) {
    const logDate = new Date(log.logDate);
    logDate.setHours(0, 0, 0, 0);
    
    if (log.completionScore > HabitCompletionScore.NOT_COMPLETED) {
      if (lastDate === null || 
          logDate.getTime() === lastDate.getTime() + 24 * 60 * 60 * 1000) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
      lastDate = logDate;
    } else {
      currentStreak = 0;
      lastDate = logDate;
    }
  }
  
  return maxStreak;
}

/**
 * 计算平均完成分数
 * @param logs 习惯日志列表
 * @returns 平均分数
 */
export function calculateAverageScore(logs: HabitLogVo[]): number {
  if (!logs || logs.length === 0) return 0;
  
  const totalScore = logs.reduce((sum, log) => sum + log.completionScore, 0);
  return totalScore / logs.length;
}

/**
 * 计算平均情绪值
 * @param logs 习惯日志列表
 * @returns 平均情绪值
 */
export function calculateAverageMood(logs: HabitLogVo[]): number {
  const logsWithMood = logs.filter(log => log.mood !== undefined && log.mood !== null);
  if (logsWithMood.length === 0) return 0;
  
  const totalMood = logsWithMood.reduce((sum, log) => sum + (log.mood || 0), 0);
  return totalMood / logsWithMood.length;
}

/**
 * 生成习惯统计信息
 * @param habit 习惯信息
 * @param logs 习惯日志列表
 * @returns 统计信息
 */
export function generateHabitStatistics(habit: HabitVo, logs: HabitLogVo[]): HabitStatisticsVo {
  const now = new Date();
  const startDate = new Date(habit.startDate);
  const totalDays = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  
  const completedLogs = logs.filter(log => 
    log.completionScore > HabitCompletionScore.NOT_COMPLETED
  );
  
  const completedDays = completedLogs.length;
  const completionRate = calculateCompletionRate(completedDays, totalDays);
  const averageScore = calculateAverageScore(logs);
  
  // 计算本周完成率
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const weekLogs = logs.filter(log => new Date(log.logDate) >= weekStart);
  const weekCompletedLogs = weekLogs.filter(log => 
    log.completionScore > HabitCompletionScore.NOT_COMPLETED
  );
  const weeklyCompletionRate = calculateCompletionRate(
    weekCompletedLogs.length, 
    Math.min(7, Math.ceil((now.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000)))
  );
  
  // 计算本月完成率
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthLogs = logs.filter(log => new Date(log.logDate) >= monthStart);
  const monthCompletedLogs = monthLogs.filter(log => 
    log.completionScore > HabitCompletionScore.NOT_COMPLETED
  );
  const monthlyCompletionRate = calculateCompletionRate(
    monthCompletedLogs.length,
    Math.ceil((now.getTime() - monthStart.getTime()) / (24 * 60 * 60 * 1000))
  );
  
  const lastCompletedLog = completedLogs
    .sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime())[0];
  
  return {
    totalDays,
    completedDays,
    completionRate,
    averageScore,
    weeklyCompletionRate,
    monthlyCompletionRate,
    bestStreak: habit.longestStreak,
    currentStreakDays: habit.currentStreak,
    lastCompletedDate: lastCompletedLog ? new Date(lastCompletedLog.logDate) : undefined,
    nextReminderTime: habit.needReminder && habit.reminderTime ? 
      calculateNextReminderTime(habit.reminderTime) : undefined,
  };
}

/**
 * 计算下次提醒时间
 * @param reminderTime 提醒时间 (HH:MM)
 * @returns 下次提醒时间
 */
export function calculateNextReminderTime(reminderTime: string): Date {
  const now = new Date();
  const [hours, minutes] = reminderTime.split(':').map(Number);
  
  const nextReminder = new Date(now);
  nextReminder.setHours(hours, minutes, 0, 0);
  
  // 如果今天的提醒时间已过，设置为明天
  if (nextReminder <= now) {
    nextReminder.setDate(nextReminder.getDate() + 1);
  }
  
  return nextReminder;
}

/**
 * 验证习惯名称
 * @param name 习惯名称
 * @returns 验证结果
 */
export function validateHabitName(name: string): { valid: boolean; message?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: "习惯名称不能为空" };
  }
  
  if (name.length < HABIT_VALIDATION.NAME.MIN_LENGTH) {
    return { valid: false, message: "习惯名称过短" };
  }
  
  if (name.length > HABIT_VALIDATION.NAME.MAX_LENGTH) {
    return { valid: false, message: "习惯名称过长" };
  }
  
  return { valid: true };
}

/**
 * 验证提醒时间格式
 * @param reminderTime 提醒时间
 * @returns 验证结果
 */
export function validateReminderTime(reminderTime: string): { valid: boolean; message?: string } {
  if (!HABIT_VALIDATION.REMINDER_TIME.PATTERN.test(reminderTime)) {
    return { valid: false, message: "提醒时间格式无效，请使用 HH:MM 格式" };
  }
  
  return { valid: true };
}

/**
 * 获取习惯状态显示文本
 * @param status 习惯状态
 * @returns 显示文本
 */
export function getHabitStatusText(status: HabitStatus): string {
  const statusMap = {
    [HabitStatus.ACTIVE]: "活跃中",
    [HabitStatus.PAUSED]: "已暂停",
    [HabitStatus.COMPLETED]: "已完成",
    [HabitStatus.ABANDONED]: "已放弃",
  };
  
  return statusMap[status] || "未知状态";
}

/**
 * 获取习惯频率显示文本
 * @param frequency 习惯频率
 * @returns 显示文本
 */
export function getHabitFrequencyText(frequency: HabitFrequency): string {
  const frequencyMap = {
    [HabitFrequency.DAILY]: "每天",
    [HabitFrequency.WEEKLY]: "每周",
    [HabitFrequency.MONTHLY]: "每月",
    [HabitFrequency.CUSTOM]: "自定义",
  };
  
  return frequencyMap[frequency] || "未知频率";
}

/**
 * 获取习惯难度显示文本
 * @param difficulty 习惯难度
 * @returns 显示文本
 */
export function getHabitDifficultyText(difficulty: HabitDifficulty): string {
  const difficultyMap = {
    [HabitDifficulty.EASY]: "容易",
    [HabitDifficulty.MEDIUM]: "中等",
    [HabitDifficulty.HARD]: "困难",
  };
  
  return difficultyMap[difficulty] || "未知难度";
}

/**
 * 获取完成分数显示文本
 * @param score 完成分数
 * @returns 显示文本
 */
export function getCompletionScoreText(score: HabitCompletionScore): string {
  const scoreMap = {
    [HabitCompletionScore.NOT_COMPLETED]: "未完成",
    [HabitCompletionScore.PARTIALLY_COMPLETED]: "部分完成",
    [HabitCompletionScore.FULLY_COMPLETED]: "完全完成",
  };
  
  return scoreMap[score] || "未知状态";
}

/**
 * 判断习惯是否健康
 * @param habit 习惯信息
 * @param statistics 统计信息
 * @returns 健康状态
 */
export function isHabitHealthy(habit: HabitVo, statistics: HabitStatisticsVo): {
  healthy: boolean;
  level: "excellent" | "good" | "average" | "poor";
  issues: string[];
} {
  const issues: string[] = [];
  let score = 0;
  
  // 完成率评分
  if (statistics.completionRate >= HABIT_STATISTICS.COMPLETION_RATE.EXCELLENT) {
    score += 40;
  } else if (statistics.completionRate >= HABIT_STATISTICS.COMPLETION_RATE.GOOD) {
    score += 30;
  } else if (statistics.completionRate >= HABIT_STATISTICS.COMPLETION_RATE.AVERAGE) {
    score += 20;
  } else {
    score += 10;
    issues.push("完成率偏低");
  }
  
  // 连续性评分
  if (statistics.currentStreakDays >= HABIT_STATISTICS.STREAK.EXCELLENT_STREAK) {
    score += 30;
  } else if (statistics.currentStreakDays >= HABIT_STATISTICS.STREAK.MIN_DAYS_FOR_HABIT) {
    score += 20;
  } else if (statistics.currentStreakDays >= 7) {
    score += 15;
  } else {
    score += 5;
    issues.push("连续性不足");
  }
  
  // 活跃度评分
  const daysSinceLastCompleted = statistics.lastCompletedDate ? 
    Math.ceil((Date.now() - statistics.lastCompletedDate.getTime()) / (24 * 60 * 60 * 1000)) : 
    Infinity;
  
  if (daysSinceLastCompleted <= 1) {
    score += 20;
  } else if (daysSinceLastCompleted <= 3) {
    score += 15;
  } else if (daysSinceLastCompleted <= 7) {
    score += 10;
  } else {
    score += 0;
    issues.push("最近活跃度不高");
  }
  
  // 趋势评分
  if (statistics.weeklyCompletionRate > statistics.monthlyCompletionRate) {
    score += 10; // 有改善趋势
  }
  
  let level: "excellent" | "good" | "average" | "poor";
  if (score >= 85) {
    level = "excellent";
  } else if (score >= 70) {
    level = "good";
  } else if (score >= 50) {
    level = "average";
  } else {
    level = "poor";
  }
  
  return {
    healthy: score >= 70,
    level,
    issues,
  };
}

/**
 * 生成日期范围
 * @param period 时间周期
 * @param baseDate 基准日期，默认为今天
 * @returns 日期范围
 */
export function generateDateRange(period: TimePeriod, baseDate: Date = new Date()): DateRange {
  const end = new Date(baseDate);
  end.setHours(23, 59, 59, 999);
  
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);
  
  switch (period) {
    case "day":
      // 当天
      break;
    case "week":
      start.setDate(start.getDate() - start.getDay()); // 本周开始
      break;
    case "month":
      start.setDate(1); // 本月开始
      break;
    case "quarter":
      const quarter = Math.floor(start.getMonth() / 3);
      start.setMonth(quarter * 3, 1); // 本季度开始
      break;
    case "year":
      start.setMonth(0, 1); // 本年开始
      break;
  }
  
  return { from: start, to: end };
}

/**
 * 格式化日期为字符串
 * @param date 日期
 * @param format 格式，默认为 YYYY-MM-DD
 * @returns 格式化后的字符串
 */
export function formatDate(date: Date, format: string = "YYYY-MM-DD"): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day);
}

/**
 * 检查是否为今天
 * @param date 要检查的日期
 * @returns 是否为今天
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return formatDate(date) === formatDate(today);
}

/**
 * 检查是否为昨天
 * @param date 要检查的日期
 * @returns 是否为昨天
 */
export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(date) === formatDate(yesterday);
} 