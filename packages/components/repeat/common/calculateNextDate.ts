import dayjs, { Dayjs } from 'dayjs';
import { Repeat, RepeatFormWeekly, RepeatFormMonthly, RepeatFormYearly, RepeatFormCustom } from '../types';
import { RepeatMode, OrdinalWeek, OrdinalDay, OrdinalDayType, MonthlyType, YearlyType, TimeUnit } from '../types';
import { getNextWorkday, getNextRestDay } from 'chinese-holiday-calendar';
import {
  isRepeatFormWeeklyConfig,
  isRepeatFormMonthlyConfig,
  isRepeatFormYearlyConfig,
  isRepeatFormCustomConfig,
} from './assertion';

/**
 * 根据重复配置计算下一个日期
 */
export function calculateNextDate(currentDate: Dayjs, repeat: Repeat): Dayjs | null {
  let nextDate: Dayjs | null = null;

  if (isRepeatFormWeeklyConfig(repeat)) {
    nextDate = getNextWeeklyDate(currentDate, repeat.repeatConfig);
  }
  if (isRepeatFormMonthlyConfig(repeat)) {
    nextDate = getNextMonthlyDate(currentDate, repeat.repeatConfig);
  }
  if (isRepeatFormYearlyConfig(repeat)) {
    nextDate = getNextYearlyDate(currentDate, repeat.repeatConfig);
  }
  if (isRepeatFormCustomConfig(repeat)) {
    nextDate = getNextCustomDate(currentDate, repeat.repeatConfig);
  }

  switch (repeat.repeatMode) {
    case RepeatMode.DAILY:
      nextDate = currentDate.add(1, 'day');
      break;

    case RepeatMode.WEEKDAYS:
      // 周一至周五
      nextDate = getNextWeekday(currentDate);
      break;

    case RepeatMode.WEEKEND:
      // 周末（周六、周日）
      nextDate = getNextWeekend(currentDate);
      break;

    case RepeatMode.WORKDAYS:
      // 获取下一个工作日
      nextDate = getNextWorkdayDate(currentDate);
      break;

    case RepeatMode.REST_DAY:
      // 获取下一个休息日
      nextDate = getNextRestDate(currentDate);
      break;

    case RepeatMode.NONE:
    default:
      break;
  }

  return nextDate;
}

/**
 * 获取下一个工作日（周一至周五）
 */
function getNextWeekday(currentDate: Dayjs): Dayjs {
  const nextDay = currentDate.add(1, 'day');
  const dayOfWeek = nextDay.day();

  // 周日(0)加1天到周一，周六(6)加2天到周一
  if (dayOfWeek === 0) {
    return nextDay.add(1, 'day');
  }
  if (dayOfWeek === 6) {
    return nextDay.add(2, 'day');
  }

  return nextDay;
}

/**
 * 获取下一个周末日期（周六、周日）
 */
function getNextWeekend(currentDate: Dayjs): Dayjs {
  const nextDay = currentDate.add(1, 'day');
  const dayOfWeek = nextDay.day();

  // 如果不是周六(6)或周日(0)，计算到下一个周六的天数
  if (dayOfWeek !== 0 && dayOfWeek !== 6) {
    return nextDay.add(6 - dayOfWeek, 'day');
  }

  return nextDay;
}

/**
 * 获取下一个每周重复的日期
 */
function getNextWeeklyDate(currentDate: Dayjs, config: RepeatFormWeekly['repeatConfig']): Dayjs {
  if (!config || !config.weekdays || config.weekdays.length === 0) {
    return currentDate.add(7, 'day');
  }

  const weekdays = config.weekdays.map(Number);
  // 将星期转换为dayjs的格式（dayjs: 0=周日, 1=周一, ..., 6=周六）
  const dayjsWeekdays = weekdays.map((day: number) => (day === 7 ? 0 : day));

  // 获取当前星期几
  const currentDayOfWeek = currentDate.day();

  // 找出下一个重复日期
  for (let daysToAdd = 1; daysToAdd <= 7; daysToAdd++) {
    const nextDate = currentDate.add(daysToAdd, 'day');
    if (dayjsWeekdays.includes(nextDate.day())) {
      return nextDate;
    }
  }

  // 如果没有找到匹配的星期几，返回一周后的日期
  return currentDate.add(7, 'day');
}

/**
 * 获取下一个每月重复的日期
 */
function getNextMonthlyDate(currentDate: Dayjs, config: RepeatFormMonthly['repeatConfig']): Dayjs {
  if (!config) {
    return currentDate.add(1, 'month');
  }

  const { monthlyType } = config;

  if (monthlyType === MonthlyType.DAY) {
    // 按日期重复，例如每月15号
    const day = config[MonthlyType.DAY];
    const nextMonth = currentDate.add(1, 'month');
    const daysInMonth = nextMonth.daysInMonth();

    // 确保日期不超过月份天数
    const targetDay = Math.min(day, daysInMonth);
    return nextMonth.date(targetDay);
  }
  if (monthlyType === MonthlyType.ORDINAL_WEEK) {
    // 按序数周重复，例如每月第一个周一
    const { ordinalWeek, ordinalWeekdays } = config[MonthlyType.ORDINAL_WEEK];

    if (!ordinalWeekdays || ordinalWeekdays.length === 0) {
      return currentDate.add(1, 'month');
    }

    // 转换为dayjs星期格式
    const targetWeekday = ordinalWeekdays[0] === 7 ? 0 : ordinalWeekdays[0];
    const nextMonth = currentDate.add(1, 'month').startOf('month');

    return findOrdinalWeekday(nextMonth, targetWeekday, ordinalWeek);
  }
  if (monthlyType === MonthlyType.ORDINAL_DAY) {
    // 按序数日重复，例如每月最后一天
    const { ordinalDay, ordinalDayType } = config[MonthlyType.ORDINAL_DAY];
    const nextMonth = currentDate.add(1, 'month');

    return findOrdinalDay(nextMonth, ordinalDay, ordinalDayType);
  }

  return currentDate.add(1, 'month');
}

/**
 * 获取下一个每年重复的日期
 */
function getNextYearlyDate(currentDate: Dayjs, config: RepeatFormYearly['repeatConfig']): Dayjs {
  if (!config) {
    return currentDate.add(1, 'year');
  }

  const { yearlyType } = config;

  if (yearlyType === YearlyType.MONTH) {
    // 按月份和日期重复，例如每年5月15日
    return getNextMonthlyDate(currentDate.add(1, 'year').subtract(1, 'month'), config[YearlyType.MONTH]);
  }
  if (yearlyType === YearlyType.ORDINAL_WEEK) {
    // 按序数周重复，例如每年3月的第二个周二
    const { ordinalWeek, ordinalWeekdays } = config[YearlyType.ORDINAL_WEEK];

    if (!ordinalWeekdays || ordinalWeekdays.length === 0) {
      return currentDate.add(1, 'year');
    }

    // 转换为dayjs星期格式
    const targetWeekday = ordinalWeekdays[0] === 7 ? 0 : ordinalWeekdays[0];
    const nextYear = currentDate.add(1, 'year');
    const sameMonthNextYear = nextYear.month(currentDate.month()).startOf('month');

    return findOrdinalWeekday(sameMonthNextYear, targetWeekday, ordinalWeek);
  }

  return currentDate.add(1, 'year');
}

/**
 * 获取下一个自定义间隔的日期
 */
function getNextCustomDate(currentDate: Dayjs, config: RepeatFormCustom['repeatConfig']): Dayjs {
  if (!config) {
    return currentDate.add(1, 'day');
  }

  const { interval, intervalUnit } = config;

  switch (intervalUnit) {
    case TimeUnit.DAY:
      return currentDate.add(interval || 1, 'day');

    case TimeUnit.WEEK:
      if (config[TimeUnit.WEEK]) {
        // 获取特定的星期几
        const weekConfig = config[TimeUnit.WEEK];
        // 先加上指定的周数
        const baseDate = currentDate.add(interval || 1, 'week');
        return getNextWeeklyDate(baseDate, weekConfig);
      }
      return currentDate.add(interval || 1, 'week');

    case TimeUnit.MONTH:
      if (config[TimeUnit.MONTH]) {
        // 获取特定的月份日期配置
        const monthConfig = config[TimeUnit.MONTH];
        // 先加上指定的月数
        const baseDate = currentDate.add(interval || 1, 'month');
        return getNextMonthlyDate(baseDate, monthConfig);
      }
      return currentDate.add(interval || 1, 'month');

    case TimeUnit.YEAR:
      if (config[TimeUnit.YEAR]) {
        // 获取特定的年份配置
        const yearConfig = config[TimeUnit.YEAR];
        // 先加上指定的年数
        const baseDate = currentDate.add(interval || 1, 'year');
        return getNextYearlyDate(baseDate, yearConfig);
      }
      return currentDate.add(interval || 1, 'year');

    default:
      return currentDate.add(1, 'day');
  }
}

/**
 * 查找指定月份中的序数星期几
 * @param baseDate 基准日期（月份的第一天）
 * @param weekday 星期几 (0-6，0表示周日)
 * @param ordinalWeek 第几个 (FIRST, SECOND, ...)
 */
function findOrdinalWeekday(baseDate: Dayjs, weekday: number, ordinalWeek: OrdinalWeek): Dayjs {
  const startOfMonth = baseDate.startOf('month');
  const endOfMonth = baseDate.endOf('month');
  let currentDate = startOfMonth;

  // 找到月份中第一个符合星期几的日期
  while (currentDate.day() !== weekday) {
    currentDate = currentDate.add(1, 'day');
  }

  // 根据序数找到对应的日期
  switch (ordinalWeek) {
    case OrdinalWeek.FIRST:
      return currentDate;

    case OrdinalWeek.SECOND:
      return currentDate.add(7, 'day');

    case OrdinalWeek.THIRD:
      return currentDate.add(14, 'day');

    case OrdinalWeek.FOURTH:
      return currentDate.add(21, 'day');

    // 直接返回第四周+7天，并检查是否超出月份
    case OrdinalWeek.LAST:
      // 从月末开始向前查找
      currentDate = endOfMonth;
      while (currentDate.day() !== weekday) {
        currentDate = currentDate.subtract(1, 'day');
      }
      return currentDate;

    case OrdinalWeek.SECOND_LAST:
      // 找到最后一个符合星期几的日期
      currentDate = endOfMonth;
      while (currentDate.day() !== weekday) {
        currentDate = currentDate.subtract(1, 'day');
      }
      // 再往前一周
      return currentDate.subtract(7, 'day');

    default:
      return currentDate;
  }
}

/**
 * 查找指定月份中的序数日
 */
function findOrdinalDay(baseDate: Dayjs, ordinalDay: OrdinalDay, ordinalDayType: OrdinalDayType): Dayjs {
  const startOfMonth = baseDate.startOf('month');
  const endOfMonth = baseDate.endOf('month');

  // 目前仅实现自然日的情况，工作日和节假日需要额外的日历服务
  if (ordinalDayType !== OrdinalDayType.DAY) {
    return startOfMonth;
  }

  switch (ordinalDay) {
    case OrdinalDay.FIRST:
      return startOfMonth;

    case OrdinalDay.SECOND:
      return startOfMonth.add(1, 'day');

    case OrdinalDay.THIRD:
      return startOfMonth.add(2, 'day');

    case OrdinalDay.FOURTH:
      return startOfMonth.add(3, 'day');

    case OrdinalDay.LAST:
      return endOfMonth;

    case OrdinalDay.SECOND_LAST:
      return endOfMonth.subtract(1, 'day');

    default:
      return startOfMonth;
  }
}

/**
 * 获取下一个工作日
 */
function getNextWorkdayDate(currentDate: Dayjs): Dayjs {
  const nextWorkdayStr = getNextWorkday(currentDate.toDate());
  return dayjs(nextWorkdayStr);
}

/**
 * 获取下一个节假日
 */
function getNextRestDate(currentDate: Dayjs): Dayjs {
  const nextRestStr = getNextRestDay(currentDate.toDate());
  return dayjs(nextRestStr);
}
