// 导出类型定义
export * from './types';

// 导出工具函数
export * from './utils';

// 导出主要的日历类
export { ChineseCalendar } from './calendar';

// 创建默认实例
import { ChineseCalendar } from './calendar';
export const calendar = new ChineseCalendar();

// 便捷函数，直接使用默认实例
export const isWorkday = (date: Date | string) => calendar.isWorkday(date);
export const isHoliday = (date: Date | string) => calendar.isHoliday(date);
export const isMakeupDay = (date: Date | string) => calendar.isMakeupDay(date);
export const getDateInfo = (date: Date | string) => calendar.getDateInfo(date);
export const getWorkdaysInYear = (year: number) => calendar.getWorkdaysInYear(year);
export const getNonWorkdaysInYear = (year: number) => calendar.getNonWorkdaysInYear(year);
export const getWorkdaysInMonth = (year: number, month: number) => calendar.getWorkdaysInMonth(year, month);
export const getNonWorkdaysInMonth = (year: number, month: number) => calendar.getNonWorkdaysInMonth(year, month);
export const getHolidaysInYear = (year: number) => calendar.getHolidaysInYear(year);
export const getMakeupDaysInYear = (year: number) => calendar.getMakeupDaysInYear(year);
export const getYearStatistics = (year: number) => calendar.getYearStatistics(year);
export const getMonthStatistics = (year: number, month: number) => calendar.getMonthStatistics(year, month);
export const getNextWorkday = (date: Date | string) => calendar.getNextWorkday(date);
export const getPreviousWorkday = (date: Date | string) => calendar.getPreviousWorkday(date);
export const getWorkdaysBetween = (startDate: Date | string, endDate: Date | string) => calendar.getWorkdaysBetween(startDate, endDate);
export const getWorkdaysInRange = (startDate: Date | string, endDate: Date | string) => calendar.getWorkdaysInRange(startDate, endDate);
export const getSupportedYears = () => calendar.getSupportedYears(); 