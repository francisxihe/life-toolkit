import {
  Holiday,
  DateType,
  DateInfo,
  YearStatistics,
  MonthStatistics,
} from "./types";
import {
  formatDate,
  parseDate,
  isWeekend,
  getYearStart,
  getYearEnd,
  getMonthStart,
  getMonthEnd,
  isDateInRange,
  getDateRange,
  getDaysInYear,
  getDaysInMonth,
  isSameDate,
  getDayOfWeek,
} from "./utils";
import { calendarDatabase } from "./database";

/**
 * 中国日历工具类
 * 提供工作日、节假日、补班日等各种日期信息查询功能
 */
export class ChineseCalendar {
  private database = calendarDatabase;

  /**
   * 获取指定日期的详细信息
   */
  getDateInfo(date: Date | string): DateInfo {
    const targetDate = typeof date === "string" ? parseDate(date) : date;
    const dateString = formatDate(targetDate);
    const year = targetDate.getFullYear();
    const dayOfWeek = getDayOfWeek(targetDate);

    // 检查是否为补班日
    const makeupDay = this.isMakeupDay(dateString, year);
    if (makeupDay) {
      return {
        date: dateString,
        type: DateType.MAKEUP_DAY,
        isWorkday: true,
        dayOfWeek,
      };
    }

    // 检查是否为节假日
    const holiday = this.getHolidayByDate(dateString, year);
    if (holiday) {
      return {
        date: dateString,
        type: DateType.HOLIDAY,
        isWorkday: false,
        holiday,
        dayOfWeek,
      };
    }

    // 检查是否为周末
    if (isWeekend(targetDate)) {
      return {
        date: dateString,
        type: DateType.WEEKEND,
        isWorkday: false,
        dayOfWeek,
      };
    }

    // 普通工作日
    return {
      date: dateString,
      type: DateType.WORKDAY,
      isWorkday: true,
      dayOfWeek,
    };
  }

  /**
   * 判断指定日期是否为工作日
   */
  isWorkday(date: Date | string): boolean {
    return this.getDateInfo(date).isWorkday;
  }

  /**
   * 判断指定日期是否为节假日
   */
  isHoliday(date: Date | string): boolean {
    return this.getDateInfo(date).type === DateType.HOLIDAY;
  }

  /**
   * 判断指定日期是否为补班日
   */
  isMakeupDay(date: Date | string, year?: number): boolean {
    const dateString = typeof date === "string" ? date : formatDate(date);
    const targetYear = year || new Date(dateString).getFullYear();

    const holidays = this.database.Years[targetYear.toString()];
    if (!holidays) return false;

    return holidays.some((holiday) =>
      holiday.AsMakeUpDays.includes(dateString)
    );
  }

  /**
   * 获取指定年份的所有工作日
   */
  getWorkdaysInYear(year: number): string[] {
    const startDate = getYearStart(year);
    const endDate = getYearEnd(year);
    const allDates = getDateRange(startDate, endDate);

    return allDates
      .filter((date) => this.isWorkday(date))
      .map((date) => formatDate(date));
  }

  /**
   * 获取指定年份的所有非工作日
   */
  getNonWorkdaysInYear(year: number): string[] {
    const startDate = getYearStart(year);
    const endDate = getYearEnd(year);
    const allDates = getDateRange(startDate, endDate);

    return allDates
      .filter((date) => !this.isWorkday(date))
      .map((date) => formatDate(date));
  }

  /**
   * 获取指定月份的所有工作日
   */
  getWorkdaysInMonth(year: number, month: number): string[] {
    const startDate = getMonthStart(year, month);
    const endDate = getMonthEnd(year, month);
    const allDates = getDateRange(startDate, endDate);

    return allDates
      .filter((date) => this.isWorkday(date))
      .map((date) => formatDate(date));
  }

  /**
   * 获取指定月份的所有非工作日
   */
  getNonWorkdaysInMonth(year: number, month: number): string[] {
    const startDate = getMonthStart(year, month);
    const endDate = getMonthEnd(year, month);
    const allDates = getDateRange(startDate, endDate);

    return allDates
      .filter((date) => !this.isWorkday(date))
      .map((date) => formatDate(date));
  }

  /**
   * 获取指定年份的所有节假日
   */
  getHolidaysInYear(year: number): Holiday[] {
    return this.database.Years[year.toString()] || [];
  }

  /**
   * 获取指定年份的所有补班日
   */
  getMakeupDaysInYear(year: number): string[] {
    const holidays = this.getHolidaysInYear(year);
    const makeupDays: string[] = [];

    holidays.forEach((holiday) => {
      makeupDays.push(...holiday.AsMakeUpDays);
    });

    return makeupDays;
  }

  /**
   * 获取指定年份的统计信息
   */
  getYearStatistics(year: number): YearStatistics {
    const totalDays = getDaysInYear(year);
    const startDate = getYearStart(year);
    const endDate = getYearEnd(year);
    const allDates = getDateRange(startDate, endDate);

    let workdays = 0;
    let weekends = 0;
    let holidays = 0;
    let makeupDays = 0;

    allDates.forEach((date) => {
      const info = this.getDateInfo(date);
      switch (info.type) {
        case DateType.WORKDAY:
          workdays++;
          break;
        case DateType.WEEKEND:
          weekends++;
          break;
        case DateType.HOLIDAY:
          holidays++;
          break;
        case DateType.MAKEUP_DAY:
          makeupDays++;
          break;
      }
    });

    const actualWorkdays = workdays + makeupDays;

    return {
      year,
      totalDays,
      workdays,
      weekends,
      holidays,
      makeupDays,
      actualWorkdays,
    };
  }

  /**
   * 获取指定月份的统计信息
   */
  getMonthStatistics(year: number, month: number): MonthStatistics {
    const totalDays = getDaysInMonth(year, month);
    const startDate = getMonthStart(year, month);
    const endDate = getMonthEnd(year, month);
    const allDates = getDateRange(startDate, endDate);

    let workdays = 0;
    let weekends = 0;
    let holidays = 0;
    let makeupDays = 0;

    allDates.forEach((date) => {
      const info = this.getDateInfo(date);
      switch (info.type) {
        case DateType.WORKDAY:
          workdays++;
          break;
        case DateType.WEEKEND:
          weekends++;
          break;
        case DateType.HOLIDAY:
          holidays++;
          break;
        case DateType.MAKEUP_DAY:
          makeupDays++;
          break;
      }
    });

    const actualWorkdays = workdays + makeupDays;

    return {
      year,
      month,
      totalDays,
      workdays,
      weekends,
      holidays,
      makeupDays,
      actualWorkdays,
    };
  }

  /**
   * 获取下一个工作日
   */
  getNextWorkday(date: Date | string): string {
    const currentDate =
      typeof date === "string" ? parseDate(date) : new Date(date);
    let nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);

    while (!this.isWorkday(nextDate)) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    return formatDate(nextDate);
  }

  /**
   * 获取上一个工作日
   */
  getPreviousWorkday(date: Date | string): string {
    const currentDate =
      typeof date === "string" ? parseDate(date) : new Date(date);
    let prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);

    while (!this.isWorkday(prevDate)) {
      prevDate.setDate(prevDate.getDate() - 1);
    }

    return formatDate(prevDate);
  }

  /**
   * 计算两个日期之间的工作日天数
   */
  getWorkdaysBetween(startDate: Date | string, endDate: Date | string): number {
    const start =
      typeof startDate === "string" ? parseDate(startDate) : startDate;
    const end = typeof endDate === "string" ? parseDate(endDate) : endDate;

    if (start > end) {
      throw new Error("开始日期不能晚于结束日期");
    }

    const dates = getDateRange(start, end);
    return dates.filter((date) => this.isWorkday(date)).length;
  }

  /**
   * 获取指定日期范围内的所有工作日
   */
  getWorkdaysInRange(
    startDate: Date | string,
    endDate: Date | string
  ): string[] {
    const start =
      typeof startDate === "string" ? parseDate(startDate) : startDate;
    const end = typeof endDate === "string" ? parseDate(endDate) : endDate;

    if (start > end) {
      throw new Error("开始日期不能晚于结束日期");
    }

    const dates = getDateRange(start, end);
    return dates
      .filter((date) => this.isWorkday(date))
      .map((date) => formatDate(date));
  }

  /**
   * 获取支持的年份列表
   */
  getSupportedYears(): number[] {
    return Object.keys(this.database.Years)
      .map((year) => parseInt(year))
      .sort();
  }

  /**
   * 根据日期获取对应的节假日信息
   */
  private getHolidayByDate(
    dateString: string,
    year: number
  ): Holiday | undefined {
    const targetDate = parseDate(dateString);

    // 检查当前年份和前后年份的节假日数据
    const yearsToCheck = [year - 1, year, year + 1];

    for (const checkYear of yearsToCheck) {
      const holidays = this.database.Years[checkYear.toString()];
      if (!holidays) continue;

      const holiday = holidays.find((holiday) => {
        const startDate = parseDate(holiday.StartDate);
        const endDate = parseDate(holiday.EndDate);

        return isDateInRange(targetDate, startDate, endDate);
      });

      if (holiday) return holiday;
    }

    return undefined;
  }
}
