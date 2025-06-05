/**
 * 日期工具函数
 */

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 解析日期字符串为 Date 对象
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00');
}

/**
 * 判断是否为周末 (周六或周日)
 */
export function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

/**
 * 获取年份的第一天
 */
export function getYearStart(year: number): Date {
  return new Date(year, 0, 1);
}

/**
 * 获取年份的最后一天
 */
export function getYearEnd(year: number): Date {
  return new Date(year, 11, 31);
}

/**
 * 获取月份的第一天
 */
export function getMonthStart(year: number, month: number): Date {
  return new Date(year, month - 1, 1);
}

/**
 * 获取月份的最后一天
 */
export function getMonthEnd(year: number, month: number): Date {
  return new Date(year, month, 0);
}

/**
 * 判断日期是否在指定范围内
 */
export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate;
}

/**
 * 获取两个日期之间的所有日期
 */
export function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * 判断是否为闰年
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * 获取年份的总天数
 */
export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

/**
 * 获取月份的总天数
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 比较两个日期是否相等 (只比较年月日)
 */
export function isSameDate(date1: Date, date2: Date): boolean {
  return formatDate(date1) === formatDate(date2);
}

/**
 * 添加天数到日期
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 获取日期的星期几 (0-6, 0为周日)
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay();
} 