// 习惯相关常量定义

// 默认值常量
export const HABIT_DEFAULTS = {
  IMPORTANCE: 3,
  DIFFICULTY: "medium" as const,
  FREQUENCY: "daily" as const,
  STATUS: "active" as const,
  COMPLETION_SCORE: 2,
  AUTO_CREATE_TODO: true,
  NEED_REMINDER: false,
  CURRENT_STREAK: 0,
  LONGEST_STREAK: 0,
  COMPLETED_COUNT: 0,
} as const;

// 分页默认值
export const HABIT_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_SORT_BY: "createdAt" as const,
  DEFAULT_SORT_ORDER: "DESC" as const,
} as const;

// 验证规则常量
export const HABIT_VALIDATION = {
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  DESCRIPTION: {
    MAX_LENGTH: 500,
  },
  IMPORTANCE: {
    MIN: 1,
    MAX: 5,
  },
  TAGS: {
    MAX_COUNT: 10,
    MAX_LENGTH: 20,
  },
  CUSTOM_FREQUENCY: {
    MAX_LENGTH: 50,
  },
  REMINDER_TIME: {
    PATTERN: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM 格式
  },
  NOTE: {
    MAX_LENGTH: 1000,
  },
  MOOD: {
    MIN: 1,
    MAX: 5,
  },
  COMPLETION_SCORE: {
    MIN: 0,
    MAX: 2,
  },
} as const;

// 统计相关常量
export const HABIT_STATISTICS = {
  STREAK: {
    MIN_DAYS_FOR_HABIT: 21, // 形成习惯的最少天数
    EXCELLENT_STREAK: 100, // 优秀连续天数
  },
  COMPLETION_RATE: {
    EXCELLENT: 0.9, // 优秀完成率
    GOOD: 0.7, // 良好完成率
    AVERAGE: 0.5, // 平均完成率
  },
  ANALYSIS: {
    DEFAULT_PERIOD_DAYS: 30, // 默认分析周期
    MIN_DATA_POINTS: 7, // 最少数据点数量
  },
} as const;

// 提醒相关常量
export const HABIT_REMINDER = {
  DEFAULT_TIME: "09:00",
  ADVANCE_MINUTES: 5, // 提前提醒分钟数
  MAX_REMINDERS_PER_DAY: 3,
} as const;

// 导出导入相关常量
export const HABIT_EXPORT = {
  MAX_EXPORT_COUNT: 1000, // 最大导出数量
  SUPPORTED_FORMATS: ["json", "csv", "xlsx"] as const,
  DEFAULT_FORMAT: "json" as const,
} as const;

// 批量操作常量
export const HABIT_BATCH = {
  MAX_BATCH_SIZE: 100, // 最大批量操作数量
  SUPPORTED_OPERATIONS: [
    "delete",
    "pause",
    "resume", 
    "complete",
    "abandon"
  ] as const,
} as const;

// 搜索相关常量
export const HABIT_SEARCH = {
  MIN_KEYWORD_LENGTH: 2,
  MAX_KEYWORD_LENGTH: 50,
  MAX_TAGS_FILTER: 20,
  MAX_STATUS_FILTER: 10,
} as const;

// 挑战相关常量
export const HABIT_CHALLENGE = {
  MIN_DURATION: 7, // 最短挑战天数
  MAX_DURATION: 365, // 最长挑战天数
  DEFAULT_DURATION: 30,
  MAX_PARTICIPANTS: 10000,
} as const;

// 成就相关常量
export const HABIT_ACHIEVEMENT = {
  CATEGORIES: [
    "streak",
    "completion", 
    "consistency",
    "milestone",
    "special"
  ] as const,
  STREAK_MILESTONES: [7, 14, 21, 30, 60, 90, 180, 365] as const,
  COMPLETION_MILESTONES: [10, 50, 100, 500, 1000] as const,
} as const;

// 健康度评分权重
export const HABIT_HEALTH_WEIGHTS = {
  CONSISTENCY: 0.3, // 一致性权重
  PROGRESS: 0.25, // 进步权重
  ENGAGEMENT: 0.25, // 参与度权重
  BALANCE: 0.2, // 平衡度权重
} as const;

// 错误消息常量
export const HABIT_ERROR_MESSAGES = {
  NOT_FOUND: "习惯不存在",
  ALREADY_EXISTS: "习惯已存在",
  INVALID_STATUS: "无效的习惯状态",
  INVALID_FREQUENCY: "无效的习惯频率",
  INVALID_DIFFICULTY: "无效的习惯难度",
  INVALID_DATE_RANGE: "无效的日期范围",
  INVALID_COMPLETION_SCORE: "无效的完成分数",
  INVALID_MOOD: "无效的情绪值",
  INVALID_IMPORTANCE: "无效的重要程度",
  NAME_TOO_LONG: "习惯名称过长",
  DESCRIPTION_TOO_LONG: "习惯描述过长",
  TOO_MANY_TAGS: "标签数量过多",
  INVALID_REMINDER_TIME: "无效的提醒时间格式",
  BATCH_SIZE_EXCEEDED: "批量操作数量超限",
  EXPORT_COUNT_EXCEEDED: "导出数量超限",
} as const;

// 成功消息常量
export const HABIT_SUCCESS_MESSAGES = {
  CREATED: "习惯创建成功",
  UPDATED: "习惯更新成功",
  DELETED: "习惯删除成功",
  LOG_CREATED: "习惯记录创建成功",
  LOG_UPDATED: "习惯记录更新成功",
  LOG_DELETED: "习惯记录删除成功",
  BATCH_OPERATION_SUCCESS: "批量操作成功",
  EXPORT_SUCCESS: "导出成功",
  IMPORT_SUCCESS: "导入成功",
} as const; 