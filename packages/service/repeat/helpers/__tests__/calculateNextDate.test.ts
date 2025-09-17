import dayjs from 'dayjs';
import {
  RepeatMode,
  RepeatEndMode,
  MonthlyType,
  YearlyType,
  TimeUnit,
  WeekDay,
} from '@life-toolkit/service-repeat-types';
import { calculateNextDate } from '../common';
import { Repeat } from '../common/types';

describe('计算下一个重复日期', () => {
  // 使用真实的 calculateNextDate 函数进行测试
  const testCalculateNextDate = (currentDate: dayjs.Dayjs, repeat: Partial<Repeat>): dayjs.Dayjs | null => {
    const repeatObj = {
      repeatMode: RepeatMode.NONE,
      repeatConfig: undefined,
      repeatEndMode: RepeatEndMode.FOREVER,
      ...repeat,
    } as Repeat;

    return calculateNextDate(currentDate, repeatObj);
  };

  // 现在使用真实的 calculateNextDate 函数，移除了模拟实现

  // 开始测试
  const baseDate = dayjs('2023-06-15'); // 2023年6月15日，周四

  it('处理 NONE 模式', () => {
    const repeat = { repeatMode: RepeatMode.NONE };
    const result = testCalculateNextDate(baseDate, repeat);
    expect(result).toBeNull();
  });

  it('处理 DAILY 模式', () => {
    const repeat = { repeatMode: RepeatMode.DAILY };
    const result = testCalculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-06-16');
  });

  it('处理 WEEKDAYS 模式 - 从周四到周五', () => {
    const repeat = { repeatMode: RepeatMode.WEEKDAYS };
    const result = testCalculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-06-16');
  });

  it('处理 WEEKDAYS 模式 - 从周五到周一', () => {
    const repeat = { repeatMode: RepeatMode.WEEKDAYS };
    const fridayDate = dayjs('2023-06-16'); // 周五
    const result = testCalculateNextDate(fridayDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-06-19');
  });

  it('处理 WEEKEND 模式 - 从周四到周六', () => {
    const repeat = { repeatMode: RepeatMode.WEEKEND };
    const result = testCalculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-06-17');
  });

  it('处理 WEEKEND 模式 - 从周六到周日', () => {
    const repeat = { repeatMode: RepeatMode.WEEKEND };
    const saturdayDate = dayjs('2023-06-17'); // 周六
    const result = testCalculateNextDate(saturdayDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-06-18');
  });

  it('处理 WEEKLY 模式带特定星期几', () => {
    const repeat = {
      repeatMode: RepeatMode.WEEKLY,
      repeatConfig: {
        weekdays: [WeekDay.MONDAY, WeekDay.WEDNESDAY],
      },
    };

    // 从周四(15日)到下一个周一(19日)
    const result = testCalculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-06-19');
  });

  it('处理 MONTHLY 模式带特定日期', () => {
    const repeat = {
      repeatMode: RepeatMode.MONTHLY,
      repeatConfig: {
        monthlyType: MonthlyType.DAY as MonthlyType.DAY,
        [MonthlyType.DAY]: 15,
      },
      repeatEndMode: RepeatEndMode.FOREVER,
      repeatStartDate: '2023-06-01',
    };

    // 从6月15日到7月15日
    const result = testCalculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-07-15');
  });

  it('处理 YEARLY 模式', () => {
    const repeat = {
      repeatMode: RepeatMode.YEARLY,
      repeatConfig: {
        yearlyType: YearlyType.MONTH as YearlyType.MONTH,
        [YearlyType.MONTH]: {
          month: [],
          monthlyType: MonthlyType.DAY as MonthlyType.DAY,
          [MonthlyType.DAY]: 15,
        },
      },
      repeatEndMode: RepeatEndMode.FOREVER,
      repeatStartDate: '2023-06-01',
    };

    // 从2023-06-15到2024-06-15
    const result = testCalculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM')).toBe('2024-06');
  });

  it('处理 CUSTOM 模式带天数间隔', () => {
    const repeat = {
      repeatMode: RepeatMode.CUSTOM,
      repeatConfig: {
        interval: 3,
        intervalUnit: TimeUnit.DAY as TimeUnit.DAY,
      },
      repeatEndMode: RepeatEndMode.FOREVER,
      repeatStartDate: '2023-06-01',
    };

    // 从2023-06-15加3天
    const result = testCalculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-06-18');
  });

  it('处理 CUSTOM 模式带周间隔', () => {
    const repeat = {
      repeatMode: RepeatMode.CUSTOM,
      repeatConfig: {
        interval: 2,
        intervalUnit: TimeUnit.WEEK as TimeUnit.WEEK,
        [TimeUnit.WEEK]: {
          weekdays: [WeekDay.THURSDAY],
        },
      },
      repeatEndMode: RepeatEndMode.FOREVER,
      repeatStartDate: '2023-06-01',
    };

    // 从2023-06-15加2周到2023-07-06
    const result = testCalculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-07-06');
  });

  it('处理 CUSTOM 模式带月间隔', () => {
    const repeat = {
      repeatMode: RepeatMode.CUSTOM,
      repeatConfig: {
        interval: 2,
        intervalUnit: TimeUnit.MONTH as TimeUnit.MONTH,
        [TimeUnit.MONTH]: {
          monthlyType: MonthlyType.DAY as MonthlyType.DAY,
          [MonthlyType.DAY]: 15,
        },
      },
      repeatEndMode: RepeatEndMode.FOREVER,
      repeatStartDate: '2023-06-01',
    };

    // 从2023-06-15加2个月到2023-09-15
    const result = testCalculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2023-09-15');
  });

  it('处理 CUSTOM 模式带年间隔', () => {
    const repeat = {
      repeatMode: RepeatMode.CUSTOM,
      repeatConfig: {
        interval: 2,
        intervalUnit: TimeUnit.YEAR as TimeUnit.YEAR,
        [TimeUnit.YEAR]: {
          yearlyType: YearlyType.MONTH as YearlyType.MONTH,
          [YearlyType.MONTH]: {
            month: [],
            monthlyType: MonthlyType.DAY as MonthlyType.DAY,
            [MonthlyType.DAY]: 15,
          },
        },
      },
      repeatEndMode: RepeatEndMode.FOREVER,
      repeatStartDate: '2023-06-01',
    };

    // 从2023-06-15加2年到2026-06-15
    const result = testCalculateNextDate(baseDate, repeat);
    expect(result?.format('YYYY-MM-DD')).toBe('2026-06-15');
  });
});
