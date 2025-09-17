import dayjs, { Dayjs } from 'dayjs';
import {
  RepeatMode,
  MonthlyType,
  YearlyType,
  TimeUnit,
  RepeatEndMode,
  RepeatFormWeekly,
  RepeatFormMonthly,
  RepeatFormYearly,
  RepeatFormCustom,
  RepeatConfigOrdinalWeek,
  RepeatConfigOrdinalDay,
  OrdinalDay,
  OrdinalWeek,
  OrdinalDayType,
} from '@life-toolkit/service-repeat-types';
import { Repeat } from './types';
import {
  isRepeatFormWeeklyConfig,
  isRepeatFormMonthlyConfig,
  isRepeatFormYearlyConfig,
  isRepeatFormCustomConfig,
  isMonthlyTypeDay,
  isMonthlyTypeOrdinalWeek,
  isMonthlyTypeOrdinalDay,
  isYearlyTypeOrdinalWeekConfig,
} from './assertion';

/**
 * 检查日期是否符合重复配置
 * 直接根据重复规则判断日期是否有效
 * @param date - 要检查的日期
 * @param repeat - 重复配置
 * @returns 日期是否符合重复规则
 */
export function isValidDate(date: Dayjs, repeat: Repeat): boolean {
  if (repeat.repeatMode === RepeatMode.NONE) {
    return false;
  }

  // 检查日期是否在重复开始日期之前
  if (repeat.repeatStartDate && date.isBefore(dayjs(repeat.repeatStartDate), 'day')) {
    return false;
  }

  // 检查终止条件
  if (
    repeat.repeatEndMode === RepeatEndMode.TO_DATE &&
    repeat.repeatEndDate &&
    date.isAfter(dayjs(repeat.repeatEndDate), 'day')
  ) {
    return false;
  }

  if (isRepeatFormWeeklyConfig(repeat)) {
    return isValidWeeklyDate(date, repeat);
  }

  if (isRepeatFormMonthlyConfig(repeat)) {
    return isValidMonthlyDate(date, repeat);
  }

  if (isRepeatFormYearlyConfig(repeat)) {
    return isValidYearlyDate(date, repeat);
  }

  if (isRepeatFormCustomConfig(repeat)) {
    return isValidCustomDate(date, repeat);
  }

  // 根据不同的重复模式进行验证
  switch (repeat.repeatMode) {
    case RepeatMode.DAILY:
      return true; // 每天都是有效的

    case RepeatMode.WEEKDAYS:
      // 周一至周五 (1-5)
      const weekday = date.day();
      return weekday >= 1 && weekday <= 5;

    case RepeatMode.WEEKEND:
      // 周末 (0=周日, 6=周六)
      const weekendDay = date.day();
      return weekendDay === 0 || weekendDay === 6;

    case RepeatMode.WORKDAYS:
    case RepeatMode.REST_DAY:
      // 工作日和休息日需要外部日历服务，这里暂时返回true
      return true;

    default:
      return false;
  }
}

/**
 * 检查日期是否符合每周重复配置
 * @param date - 要检查的日期
 * @param repeat - 每周重复配置
 * @returns 日期是否在指定的星期几中
 */
function isValidWeeklyDate(date: Dayjs, repeat: RepeatFormWeekly): boolean {
  if (!repeat.repeatConfig?.weekdays?.length) {
    console.log('isValidWeeklyDate - 没有weekdays配置');
    return false;
  }

  const currentDayOfWeek = date.day();
  const weekdays = repeat.repeatConfig.weekdays.map((day: number) => (day === 7 ? 0 : day));
  const result = weekdays.includes(currentDayOfWeek);

  console.log(
    'isValidWeeklyDate - 日期:',
    date.format('YYYY-MM-DD'),
    '星期:',
    currentDayOfWeek,
    '配置weekdays:',
    repeat.repeatConfig.weekdays,
    '转换后:',
    weekdays,
    '结果:',
    result
  );

  return result;
}

/**
 * 检查日期是否符合每月重复配置
 * @param date - 要检查的日期
 * @param repeat - 每月重复配置
 * @returns 日期是否符合月重复规则
 */
function isValidMonthlyDate(date: Dayjs, repeat: RepeatFormMonthly): boolean {
  if (!repeat.repeatConfig) {
    return false;
  }

  if (isMonthlyTypeDay(repeat.repeatConfig)) {
    // 按日期重复，例如每月15号
    const targetDay = repeat.repeatConfig[MonthlyType.DAY];
    return date.date() === targetDay;
  }
  if (isMonthlyTypeOrdinalWeek(repeat.repeatConfig)) {
    return isValidOrdinalWeekDate(date, repeat.repeatConfig);
  }
  if (isMonthlyTypeOrdinalDay(repeat.repeatConfig)) {
    return isValidOrdinalDayDate(date, repeat.repeatConfig);
  }

  return false;
}

/**
 * 检查日期是否符合每月序数周重复配置
 * 例如：每月的第一个周一
 * @param date - 要检查的日期
 * @param repeatConfig - 序数周配置
 * @returns 日期是否符合序数周规则
 */
function isValidOrdinalWeekDate(
  date: Dayjs,
  repeatConfig: {
    monthlyType: MonthlyType.ORDINAL_WEEK;
    [MonthlyType.ORDINAL_WEEK]: RepeatConfigOrdinalWeek;
  }
): boolean {
  const config = repeatConfig[MonthlyType.ORDINAL_WEEK];
  if (!config?.ordinalWeekdays?.length) {
    return false;
  }

  const targetWeekday = config.ordinalWeekdays[0] === 7 ? 0 : config.ordinalWeekdays[0];
  const currentDayOfWeek = date.day();

  if (currentDayOfWeek !== targetWeekday) {
    return false;
  }

  // 计算这是本月的第几个目标星期几
  const firstDayOfMonth = date.startOf('month');
  let occurrence = 1;
  let currentDate = firstDayOfMonth;

  while (currentDate.isBefore(date, 'day')) {
    if (currentDate.day() === targetWeekday) {
      occurrence++;
    }
    currentDate = currentDate.add(1, 'day');
  }

  // 检查是否符合指定的序数
  switch (config.ordinalWeek) {
    case OrdinalWeek.FIRST:
      return occurrence === 1;
    case OrdinalWeek.SECOND:
      return occurrence === 2;
    case OrdinalWeek.THIRD:
      return occurrence === 3;
    case OrdinalWeek.FOURTH:
      return occurrence === 4;
    case OrdinalWeek.LAST:
      return isLastOccurrenceInMonth(date, targetWeekday);
    case OrdinalWeek.SECOND_LAST:
      return isSecondLastOccurrenceInMonth(date, targetWeekday);
    default:
      return false;
  }
}

/**
 * 检查日期是否是月份中最后一个目标星期几
 * @param date - 要检查的日期
 * @param targetWeekday - 目标星期几 (0-6, 0=周日)
 * @returns 是否是月份中最后一个目标星期几
 */
function isLastOccurrenceInMonth(date: Dayjs, targetWeekday: number): boolean {
  const lastDate = date.endOf('month');
  let currentDate = lastDate;

  while (currentDate.day() !== targetWeekday) {
    currentDate = currentDate.subtract(1, 'day');
  }

  return date.isSame(currentDate, 'day');
}

/**
 * 检查日期是否是月份中倒数第二个目标星期几
 * @param date - 要检查的日期
 * @param targetWeekday - 目标星期几 (0-6, 0=周日)
 * @returns 是否是月份中倒数第二个目标星期几
 */
function isSecondLastOccurrenceInMonth(date: Dayjs, targetWeekday: number): boolean {
  const lastDate = date.endOf('month');
  let lastOccurrence = lastDate;

  while (lastOccurrence.day() !== targetWeekday) {
    lastOccurrence = lastOccurrence.subtract(1, 'day');
  }

  const secondLastOccurrence = lastOccurrence.subtract(7, 'day');
  return date.isSame(secondLastOccurrence, 'day');
}

/**
 * 检查日期是否符合每月序数日重复配置
 * 例如：每月的第一天、最后一天
 * @param date - 要检查的日期
 * @param repeatConfig - 序数日配置
 * @returns 日期是否符合序数日规则
 */
function isValidOrdinalDayDate(
  date: Dayjs,
  repeatConfig: {
    monthlyType: MonthlyType.ORDINAL_DAY;
    [MonthlyType.ORDINAL_DAY]: RepeatConfigOrdinalDay;
  }
): boolean {
  const config = repeatConfig[MonthlyType.ORDINAL_DAY];
  if (!config) {
    return false;
  }

  const { ordinalDay, ordinalDayType } = config;
  
  // 处理自然日类型
  if (ordinalDayType === OrdinalDayType.DAY) {
    const daysInMonth = date.daysInMonth();
    switch (ordinalDay) {
      case OrdinalDay.FIRST:
        return date.date() === 1;
      case OrdinalDay.SECOND:
        return date.date() === 2;
      case OrdinalDay.THIRD:
        return date.date() === 3;
      case OrdinalDay.FOURTH:
        return date.date() === 4;
      case OrdinalDay.FIFTH:
        return date.date() === 5;
      case OrdinalDay.LAST:
        return date.date() === daysInMonth;
      case OrdinalDay.SECOND_LAST:
        return date.date() === daysInMonth - 1;
      default:
        return false;
    }
  }

  // 处理工作日和休息日类型
  if (ordinalDayType === OrdinalDayType.WORKDAY || ordinalDayType === OrdinalDayType.REST_DAY) {
    const isWorkday = ordinalDayType === OrdinalDayType.WORKDAY;
    const startOfMonth = date.startOf('month');
    const endOfMonth = date.endOf('month');
    const targetDays: Dayjs[] = [];
    
    // 收集月份中所有符合条件的日期
    let currentDate = startOfMonth;
    while (currentDate.isBefore(endOfMonth, 'day') || currentDate.isSame(endOfMonth, 'day')) {
      const dayOfWeek = currentDate.day();
      const isCurrentWorkday = dayOfWeek >= 1 && dayOfWeek <= 5; // 周一到周五为工作日
      
      if (isWorkday === isCurrentWorkday) {
        targetDays.push(currentDate);
      }
      currentDate = currentDate.add(1, 'day');
    }

    if (targetDays.length === 0) {
      return false;
    }

    // 根据序数检查日期是否匹配
    let targetDate: Dayjs | undefined;
    switch (ordinalDay) {
      case OrdinalDay.FIRST:
        targetDate = targetDays[0];
        break;
      case OrdinalDay.SECOND:
        targetDate = targetDays[1];
        break;
      case OrdinalDay.THIRD:
        targetDate = targetDays[2];
        break;
      case OrdinalDay.FOURTH:
        targetDate = targetDays[3];
        break;
      case OrdinalDay.FIFTH:
        targetDate = targetDays[4];
        break;
      case OrdinalDay.LAST:
        targetDate = targetDays[targetDays.length - 1];
        break;
      case OrdinalDay.SECOND_LAST:
        targetDate = targetDays[targetDays.length - 2];
        break;
      default:
        return false;
    }

    return targetDate ? date.isSame(targetDate, 'day') : false;
  }

  return false;
}

/**
 * 检查日期是否符合每年重复配置
 * @param date - 要检查的日期
 * @param repeat - 每年重复配置
 * @returns 日期是否符合年重复规则
 */
function isValidYearlyDate(date: Dayjs, repeat: RepeatFormYearly): boolean {
  if (!repeat.repeatConfig) {
    return false;
  }

  const { yearlyType } = repeat.repeatConfig;

  if (yearlyType === YearlyType.MONTH) {
    // 按月份配置重复，例如每年5月15日或每年5月的第一个周一
    const monthConfig = repeat.repeatConfig[YearlyType.MONTH];
    const targetMonths = monthConfig.month || [];

    // 检查月份是否匹配
    if (targetMonths.length > 0) {
      const currentMonth = date.month() + 1; // dayjs月份从0开始，转换为1-12
      if (!targetMonths.includes(currentMonth)) {
        return false;
      }
    }

    // 根据月份配置类型进一步验证
    if (isMonthlyTypeDay(monthConfig)) {
      // 按日期重复，例如每月15号
      const targetDay = monthConfig[MonthlyType.DAY];
      return date.date() === targetDay;
    }
    if (isMonthlyTypeOrdinalWeek(monthConfig)) {
      // 按序数周重复，例如每月第一个周一
      return isValidOrdinalWeekDate(date, monthConfig);
    }
    if (isMonthlyTypeOrdinalDay(monthConfig)) {
      // 按序数日重复，例如每月最后一天
      return isValidOrdinalDayDate(date, monthConfig);
    }
    return false;
  }
  if (isYearlyTypeOrdinalWeekConfig(repeat.repeatConfig)) {
    // 按序数周重复，例如每年第二个周二
    return isValidYearlyOrdinalWeekDate(date, repeat.repeatConfig);
  }

  return false;
}

/**
 * 检查日期是否符合每年序数周重复配置
 * 例如：每年的第二个周二（和月份无关）
 * @param date - 要检查的日期
 * @param repeatConfig - 每年序数周配置
 * @returns 日期是否符合每年序数周规则
 */
function isValidYearlyOrdinalWeekDate(date: Dayjs, repeatConfig: RepeatFormYearly['repeatConfig']): boolean {
  // 首先检查配置类型是否正确
  if (repeatConfig.yearlyType !== YearlyType.ORDINAL_WEEK) {
    return false;
  }

  const config = repeatConfig[YearlyType.ORDINAL_WEEK];
  if (!config?.ordinalWeekdays?.length) {
    return false;
  }

  const targetWeekday = config.ordinalWeekdays[0] === 7 ? 0 : config.ordinalWeekdays[0];

  // 检查星期几是否匹配
  if (date.day() !== targetWeekday) {
    return false;
  }

  // 计算这是今年的第几个目标星期几
  const firstDayOfYear = date.startOf('year');
  let occurrence = 1;
  let currentDate = firstDayOfYear;

  while (currentDate.isBefore(date, 'day')) {
    if (currentDate.day() === targetWeekday) {
      occurrence++;
    }
    currentDate = currentDate.add(1, 'day');
  }

  // 检查是否符合指定的序数
  switch (config.ordinalWeek) {
    case OrdinalWeek.FIRST:
      return occurrence === 1;
    case OrdinalWeek.SECOND:
      return occurrence === 2;
    case OrdinalWeek.THIRD:
      return occurrence === 3;
    case OrdinalWeek.FOURTH:
      return occurrence === 4;
    case OrdinalWeek.LAST:
      return isLastOccurrenceInYear(date, targetWeekday);
    case OrdinalWeek.SECOND_LAST:
      return isSecondLastOccurrenceInYear(date, targetWeekday);
    default:
      return false;
  }
}

/**
 * 检查日期是否是年中最后一个目标星期几
 * @param date - 要检查的日期
 * @param targetWeekday - 目标星期几 (0-6, 0=周日)
 * @returns 是否是年中最后一个目标星期几
 */
function isLastOccurrenceInYear(date: Dayjs, targetWeekday: number): boolean {
  const lastDate = date.endOf('year');
  let currentDate = lastDate;

  while (currentDate.day() !== targetWeekday) {
    currentDate = currentDate.subtract(1, 'day');
  }

  return date.isSame(currentDate, 'day');
}

/**
 * 检查日期是否是年中倒数第二个目标星期几
 * @param date - 要检查的日期
 * @param targetWeekday - 目标星期几 (0-6, 0=周日)
 * @returns 是否是年中倒数第二个目标星期几
 */
function isSecondLastOccurrenceInYear(date: Dayjs, targetWeekday: number): boolean {
  const lastDate = date.endOf('year');
  let lastOccurrence = lastDate;

  while (lastOccurrence.day() !== targetWeekday) {
    lastOccurrence = lastOccurrence.subtract(1, 'day');
  }

  const secondLastOccurrence = lastOccurrence.subtract(7, 'day');
  return date.isSame(secondLastOccurrence, 'day');
}

/**
 * 检查日期是否符合自定义间隔重复配置
 * @param date - 要检查的日期
 * @param repeat - 自定义重复配置
 * @returns 日期是否符合自定义间隔规则
 */
function isValidCustomDate(date: Dayjs, repeat: RepeatFormCustom & { repeatStartDate: string }): boolean {
  if (!repeat.repeatConfig) {
    return false;
  }

  const { interval, intervalUnit } = repeat.repeatConfig;
  const startDate = dayjs(repeat.repeatStartDate);

  if (date.isBefore(startDate, 'day')) {
    return false;
  }

  const daysDiff = date.diff(startDate, 'day');

  switch (intervalUnit) {
    case TimeUnit.DAY:
      return daysDiff % (interval || 1) === 0;

    case TimeUnit.WEEK:
      // 对于周间隔，需要检查是否匹配特定的星期几配置
      if (repeat.repeatConfig[TimeUnit.WEEK]) {
        const weekConfig = repeat.repeatConfig[TimeUnit.WEEK];
        return (
          daysDiff % ((interval || 1) * 7) === 0 &&
          isValidWeeklyDate(date, { repeatConfig: weekConfig } as RepeatFormWeekly)
        );
      }
      return daysDiff % ((interval || 1) * 7) === 0;

    case TimeUnit.MONTH:
      // 月份间隔需要检查是否匹配特定的月份配置
      if (repeat.repeatConfig[TimeUnit.MONTH]) {
        const monthConfig = repeat.repeatConfig[TimeUnit.MONTH];
        const monthsDiff = date.diff(startDate, 'month');
        return (
          monthsDiff % (interval || 1) === 0 &&
          isValidMonthlyDate(date, { repeatConfig: monthConfig } as RepeatFormMonthly)
        );
      }
      // 默认按日期重复
      const monthsDiff = date.diff(startDate, 'month');
      return monthsDiff % (interval || 1) === 0 && date.date() === startDate.date();

    case TimeUnit.YEAR:
      // 年份间隔需要检查是否匹配特定的年份配置
      if (repeat.repeatConfig[TimeUnit.YEAR]) {
        const yearConfig = repeat.repeatConfig[TimeUnit.YEAR];
        const yearsDiff = date.diff(startDate, 'year');
        return (
          yearsDiff % (interval || 1) === 0 && isValidYearlyDate(date, { repeatConfig: yearConfig } as RepeatFormYearly)
        );
      }
      // 默认按月份和日期重复
      const yearsDiff = date.diff(startDate, 'year');
      return (
        yearsDiff % (interval || 1) === 0 && date.month() === startDate.month() && date.date() === startDate.date()
      );

    default:
      return false;
  }
}
