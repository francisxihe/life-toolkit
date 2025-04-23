import dayjs from 'dayjs';
import { 
  RepeatMode, 
  RepeatEndMode, 
  MonthlyType,
  YearlyType,
  TimeUnit,
  WeekDay,
} from '../types';
import { Repeat } from '../server/entity';

describe('计算下一个重复日期', () => {
  // 模拟 any 类型以避免严格类型检查
  // 在实际业务代码中应避免 any，但在测试中使用更灵活
  type AnyRepeat = Repeat & { repeatConfig: any };

  // 模拟计算下一个日期的函数
  const calculateNextDate = (currentDate: dayjs.Dayjs, repeat: Partial<AnyRepeat>): dayjs.Dayjs | null => {
    const repeatObj = {
      id: 'test-id',
      repeatMode: RepeatMode.NONE,
      repeatConfig: {},
      repeatEndMode: RepeatEndMode.FOREVER,
      ...repeat
    } as AnyRepeat;

    let nextDate: dayjs.Dayjs | null = null;

    switch (repeatObj.repeatMode) {
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

      case RepeatMode.WEEKLY:
        // 每周指定星期几
        nextDate = getNextWeeklyDate(currentDate, repeatObj.repeatConfig);
        break;

      case RepeatMode.MONTHLY:
        // 每月重复
        nextDate = getNextMonthlyDate(currentDate, repeatObj.repeatConfig);
        break;

      case RepeatMode.YEARLY:
        // 每年重复
        nextDate = getNextYearlyDate(currentDate, repeatObj.repeatConfig);
        break;

      case RepeatMode.CUSTOM:
        // 自定义间隔
        nextDate = getNextCustomDate(currentDate, repeatObj.repeatConfig);
        break;

      case RepeatMode.NONE:
      default:
        return null;
    }

    return nextDate;
  };

  // 辅助函数：获取下一个工作日
  const getNextWeekday = (currentDate: dayjs.Dayjs): dayjs.Dayjs => {
    const nextDay = currentDate.add(1, 'day');
    const dayOfWeek = nextDay.day();
    
    // 周日(0)加1天到周一，周六(6)加2天到周一
    if (dayOfWeek === 0) {
      return nextDay.add(1, 'day');
    } else if (dayOfWeek === 6) {
      return nextDay.add(2, 'day');
    }
    
    return nextDay;
  };

  // 辅助函数：获取下一个周末日期
  const getNextWeekend = (currentDate: dayjs.Dayjs): dayjs.Dayjs => {
    const nextDay = currentDate.add(1, 'day');
    const dayOfWeek = nextDay.day();
    
    // 如果不是周六(6)或周日(0)，计算到下一个周六的天数
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      return nextDay.add(6 - dayOfWeek, 'day');
    }
    
    return nextDay;
  };

  // 辅助函数：获取下一个每周重复的日期
  const getNextWeeklyDate = (currentDate: dayjs.Dayjs, config: any): dayjs.Dayjs => {
    if (!config || !config.weekdays || config.weekdays.length === 0) {
      return currentDate.add(7, 'day');
    }
    
    const weekdays = config.weekdays.map(Number);
    // 将星期转换为dayjs的格式（dayjs: 0=周日, 1=周一, ..., 6=周六）
    const dayjsWeekdays = weekdays.map((day: number) => day === 7 ? 0 : day);
    
    // 找出下一个重复日期
    for (let daysToAdd = 1; daysToAdd <= 7; daysToAdd++) {
      const nextDate = currentDate.add(daysToAdd, 'day');
      if (dayjsWeekdays.includes(nextDate.day())) {
        return nextDate;
      }
    }
    
    // 如果没有找到匹配的星期几，返回一周后的日期
    return currentDate.add(7, 'day');
  };

  // 辅助函数：获取下一个每月重复的日期
  const getNextMonthlyDate = (currentDate: dayjs.Dayjs, config: any): dayjs.Dayjs => {
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
    else if (monthlyType === MonthlyType.ORDINAL_WEEK) {
      // 简化实现，实际场景中需要更复杂的计算
      return currentDate.add(1, 'month');
    } 
    else if (monthlyType === MonthlyType.ORDINAL_DAY) {
      // 简化实现，实际场景中需要更复杂的计算
      return currentDate.add(1, 'month');
    }
    
    return currentDate.add(1, 'month');
  };

  // 辅助函数：获取下一个每年重复的日期
  const getNextYearlyDate = (currentDate: dayjs.Dayjs, config: any): dayjs.Dayjs => {
    if (!config) {
      return currentDate.add(1, 'year');
    }
    
    const { yearlyType } = config;
    
    if (yearlyType === YearlyType.MONTH) {
      // 简化实现，实际场景中需要更复杂的计算
      return currentDate.add(1, 'year');
    } 
    else if (yearlyType === YearlyType.ORDINAL_WEEK) {
      // 简化实现，实际场景中需要更复杂的计算
      return currentDate.add(1, 'year');
    }
    
    return currentDate.add(1, 'year');
  };

  // 辅助函数：获取下一个自定义间隔的日期
  const getNextCustomDate = (currentDate: dayjs.Dayjs, config: any): dayjs.Dayjs => {
    if (!config) {
      return currentDate.add(1, 'day');
    }
    
    const { interval, intervalUnit } = config;
    
    switch (intervalUnit) {
      case TimeUnit.DAY:
        return currentDate.add(interval || 1, 'day');
      
      case TimeUnit.WEEK:
        return currentDate.add(interval || 1, 'week');
      
      case TimeUnit.MONTH:
        return currentDate.add(interval || 1, 'month');
      
      case TimeUnit.YEAR:
        return currentDate.add(interval || 1, 'year');
      
      default:
        return currentDate.add(1, 'day');
    }
  };

  // 开始测试
  const baseDate = dayjs('2023-06-15'); // 2023年6月15日，周四

  it('处理 NONE 模式', () => {
    const repeat = { repeatMode: RepeatMode.NONE };
    const result = calculateNextDate(baseDate, repeat);
    expect(result).toBeNull();
  });

  it('处理 DAILY 模式', () => {
    const repeat = { repeatMode: RepeatMode.DAILY };
    const result = calculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-06-16');
  });

  it('处理 WEEKDAYS 模式 - 从周四到周五', () => {
    const repeat = { repeatMode: RepeatMode.WEEKDAYS };
    const result = calculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-06-16');
  });

  it('处理 WEEKDAYS 模式 - 从周五到周一', () => {
    const repeat = { repeatMode: RepeatMode.WEEKDAYS };
    const fridayDate = dayjs('2023-06-16'); // 周五
    const result = calculateNextDate(fridayDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-06-19');
  });

  it('处理 WEEKEND 模式 - 从周四到周六', () => {
    const repeat = { repeatMode: RepeatMode.WEEKEND };
    const result = calculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-06-17');
  });

  it('处理 WEEKEND 模式 - 从周六到周日', () => {
    const repeat = { repeatMode: RepeatMode.WEEKEND };
    const saturdayDate = dayjs('2023-06-17'); // 周六
    const result = calculateNextDate(saturdayDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-06-18');
  });

  it('处理 WEEKLY 模式带特定星期几', () => {
    const repeat = { 
      repeatMode: RepeatMode.WEEKLY,
      repeatConfig: {
        weekdays: [WeekDay.MONDAY, WeekDay.WEDNESDAY]
      }
    };
    
    // 从周四(15日)到下一个周一(19日)
    const result = calculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-06-19');
  });

  it('处理 MONTHLY 模式带特定日期', () => {
    const repeat = { 
      repeatMode: RepeatMode.MONTHLY,
      repeatConfig: {
        monthlyType: MonthlyType.DAY,
        day: 15
      }
    };
    
    // 从6月15日到7月15日
    const result = calculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-07-15');
  });

  it('处理 YEARLY 模式', () => {
    const repeat = { 
      repeatMode: RepeatMode.YEARLY,
      repeatConfig: {
        yearlyType: YearlyType.MONTH,
        month: {
          monthlyType: MonthlyType.DAY,
          day: 15
        }
      }
    };
    
    // 从2023-06-15到2024-06-15
    const result = calculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM')).toBe('2024-06');
  });

  it('处理 CUSTOM 模式带天数间隔', () => {
    const repeat = { 
      repeatMode: RepeatMode.CUSTOM,
      repeatConfig: {
        interval: 3,
        intervalUnit: TimeUnit.DAY
      }
    };
    
    // 从2023-06-15加3天
    const result = calculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-06-18');
  });

  it('处理 CUSTOM 模式带周间隔', () => {
    const repeat = { 
      repeatMode: RepeatMode.CUSTOM,
      repeatConfig: {
        interval: 2,
        intervalUnit: TimeUnit.WEEK,
        week: {
          weekdays: [WeekDay.MONDAY]
        }
      }
    };
    
    // 从2023-06-15加2周
    const result = calculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-06-29');
  });

  it('处理 CUSTOM 模式带月间隔', () => {
    const repeat = { 
      repeatMode: RepeatMode.CUSTOM,
      repeatConfig: {
        interval: 3,
        intervalUnit: TimeUnit.MONTH,
        month: {
          monthlyType: MonthlyType.DAY,
          day: 15
        }
      }
    };
    
    // 从2023-06-15加3个月
    const result = calculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-09-15');
  });

  it('处理 CUSTOM 模式带年间隔', () => {
    const repeat = { 
      repeatMode: RepeatMode.CUSTOM,
      repeatConfig: {
        interval: 2,
        intervalUnit: TimeUnit.YEAR,
        year: {
          yearlyType: YearlyType.MONTH,
          month: {
            monthlyType: MonthlyType.DAY,
            day: 15
          }
        }
      }
    };
    
    // 从2023-06-15加2年
    const result = calculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2025-06-15');
  });
}); 