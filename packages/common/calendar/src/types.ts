/**
 * 节假日信息
 */
export interface Holiday {
  /** 节假日名称 */
  Name: string;
  /** 开始日期 */
  StartDate: string;
  /** 结束日期 */
  EndDate: string;
  /** 持续天数 */
  Duration: number;
  /** 补班日期 */
  AsMakeUpDays: string[];
}

/**
 * 日期类型枚举
 */
export enum DateType {
  /** 工作日 */
  WORKDAY = "workday",
  /** 周末 */
  WEEKEND = "weekend",
  /** 节假日 */
  HOLIDAY = "holiday",
  /** 补班日 */
  MAKEUP_DAY = "makeup_day",
}

/**
 * 日期信息
 */
export interface DateInfo {
  /** 日期字符串 (YYYY-MM-DD) */
  date: string;
  /** 日期类型 */
  type: DateType;
  /** 是否为工作日 */
  isWorkday: boolean;
  /** 如果是节假日，返回节假日信息 */
  holiday?: Holiday;
  /** 星期几 (0-6, 0为周日) */
  dayOfWeek: number;
}

/**
 * 年度统计信息
 */
export interface YearStatistics {
  /** 年份 */
  year: number;
  /** 总天数 */
  totalDays: number;
  /** 工作日天数 */
  workdays: number;
  /** 周末天数 */
  weekends: number;
  /** 节假日天数 */
  holidays: number;
  /** 补班日天数 */
  makeupDays: number;
  /** 实际工作日天数 (工作日 + 补班日 - 节假日中的工作日) */
  actualWorkdays: number;
}

/**
 * 月度统计信息
 */
export interface MonthStatistics {
  /** 年份 */
  year: number;
  /** 月份 (1-12) */
  month: number;
  /** 总天数 */
  totalDays: number;
  /** 工作日天数 */
  workdays: number;
  /** 周末天数 */
  weekends: number;
  /** 节假日天数 */
  holidays: number;
  /** 补班日天数 */
  makeupDays: number;
  /** 实际工作日天数 */
  actualWorkdays: number;
}
