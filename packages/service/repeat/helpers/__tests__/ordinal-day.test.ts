import dayjs from 'dayjs';
import { RepeatMode, RepeatEndMode, MonthlyType, OrdinalDay, OrdinalDayType } from '@life-toolkit/service-repeat-types';
import { calculateNextDate, isValidDate } from '../common';
import { Repeat } from '../common/types';

describe('序数日重复模式测试', () => {
  const baseDate = dayjs('2023-06-15'); // 2023年6月15日，周四

  describe('自然日类型', () => {
    it('应该计算每月第一天', () => {
      const repeat: Repeat = {
        repeatMode: RepeatMode.MONTHLY,
        repeatConfig: {
          monthlyType: MonthlyType.ORDINAL_DAY,
          [MonthlyType.ORDINAL_DAY]: {
            ordinalDay: OrdinalDay.FIRST,
            ordinalDayType: OrdinalDayType.DAY,
          },
        },
        repeatEndMode: RepeatEndMode.FOREVER,
        repeatStartDate: '2023-06-01',
      };

      const nextDate = calculateNextDate(baseDate, repeat);
      expect(nextDate?.format('YYYY-MM-DD')).toBe('2023-07-01');
    });

    it('应该计算每月最后一天', () => {
      const repeat: Repeat = {
        repeatMode: RepeatMode.MONTHLY,
        repeatConfig: {
          monthlyType: MonthlyType.ORDINAL_DAY,
          [MonthlyType.ORDINAL_DAY]: {
            ordinalDay: OrdinalDay.LAST,
            ordinalDayType: OrdinalDayType.DAY,
          },
        },
        repeatEndMode: RepeatEndMode.FOREVER,
        repeatStartDate: '2023-06-01',
      };

      const nextDate = calculateNextDate(baseDate, repeat);
      expect(nextDate?.format('YYYY-MM-DD')).toBe('2023-07-31');
    });

    it('应该计算每月第五天', () => {
      const repeat: Repeat = {
        repeatMode: RepeatMode.MONTHLY,
        repeatConfig: {
          monthlyType: MonthlyType.ORDINAL_DAY,
          [MonthlyType.ORDINAL_DAY]: {
            ordinalDay: OrdinalDay.FIFTH,
            ordinalDayType: OrdinalDayType.DAY,
          },
        },
        repeatEndMode: RepeatEndMode.FOREVER,
        repeatStartDate: '2023-06-01',
      };

      const nextDate = calculateNextDate(baseDate, repeat);
      expect(nextDate?.format('YYYY-MM-DD')).toBe('2023-07-05');
    });
  });

  describe('工作日类型', () => {
    it('应该计算每月第一个工作日', () => {
      const repeat: Repeat = {
        repeatMode: RepeatMode.MONTHLY,
        repeatConfig: {
          monthlyType: MonthlyType.ORDINAL_DAY,
          [MonthlyType.ORDINAL_DAY]: {
            ordinalDay: OrdinalDay.FIRST,
            ordinalDayType: OrdinalDayType.WORKDAY,
          },
        },
        repeatEndMode: RepeatEndMode.FOREVER,
        repeatStartDate: '2023-06-01',
      };

      const nextDate = calculateNextDate(baseDate, repeat);
      // 2023年7月第一个工作日是7月3日（周一）
      expect(nextDate?.format('YYYY-MM-DD')).toBe('2023-07-03');
    });

    it('应该计算每月最后一个工作日', () => {
      const repeat: Repeat = {
        repeatMode: RepeatMode.MONTHLY,
        repeatConfig: {
          monthlyType: MonthlyType.ORDINAL_DAY,
          [MonthlyType.ORDINAL_DAY]: {
            ordinalDay: OrdinalDay.LAST,
            ordinalDayType: OrdinalDayType.WORKDAY,
          },
        },
        repeatEndMode: RepeatEndMode.FOREVER,
        repeatStartDate: '2023-06-01',
      };

      const nextDate = calculateNextDate(baseDate, repeat);
      // 2023年7月最后一个工作日是7月31日（周一）
      expect(nextDate?.format('YYYY-MM-DD')).toBe('2023-07-31');
    });
  });

  describe('休息日类型', () => {
    it('应该计算每月第一个休息日', () => {
      const repeat: Repeat = {
        repeatMode: RepeatMode.MONTHLY,
        repeatConfig: {
          monthlyType: MonthlyType.ORDINAL_DAY,
          [MonthlyType.ORDINAL_DAY]: {
            ordinalDay: OrdinalDay.FIRST,
            ordinalDayType: OrdinalDayType.REST_DAY,
          },
        },
        repeatEndMode: RepeatEndMode.FOREVER,
        repeatStartDate: '2023-06-01',
      };

      const nextDate = calculateNextDate(baseDate, repeat);
      // 2023年7月第一个休息日是7月1日（周六）
      expect(nextDate?.format('YYYY-MM-DD')).toBe('2023-07-01');
    });

    it('应该计算每月最后一个休息日', () => {
      const repeat: Repeat = {
        repeatMode: RepeatMode.MONTHLY,
        repeatConfig: {
          monthlyType: MonthlyType.ORDINAL_DAY,
          [MonthlyType.ORDINAL_DAY]: {
            ordinalDay: OrdinalDay.LAST,
            ordinalDayType: OrdinalDayType.REST_DAY,
          },
        },
        repeatEndMode: RepeatEndMode.FOREVER,
        repeatStartDate: '2023-06-01',
      };

      const nextDate = calculateNextDate(baseDate, repeat);
      // 2023年7月最后一个休息日是7月30日（周日）
      expect(nextDate?.format('YYYY-MM-DD')).toBe('2023-07-30');
    });
  });

  describe('日期验证', () => {
    it('应该验证自然日类型的日期', () => {
      const repeat: Repeat = {
        repeatMode: RepeatMode.MONTHLY,
        repeatConfig: {
          monthlyType: MonthlyType.ORDINAL_DAY,
          [MonthlyType.ORDINAL_DAY]: {
            ordinalDay: OrdinalDay.LAST,
            ordinalDayType: OrdinalDayType.DAY,
          },
        },
        repeatEndMode: RepeatEndMode.FOREVER,
        repeatStartDate: '2023-06-01',
      };

      // 测试6月30日（6月最后一天）
      const lastDayOfJune = dayjs('2023-06-30');
      expect(isValidDate(lastDayOfJune, repeat)).toBe(true);

      // 测试6月29日（不是最后一天）
      const notLastDay = dayjs('2023-06-29');
      expect(isValidDate(notLastDay, repeat)).toBe(false);
    });

    it('应该验证工作日类型的日期', () => {
      const repeat: Repeat = {
        repeatMode: RepeatMode.MONTHLY,
        repeatConfig: {
          monthlyType: MonthlyType.ORDINAL_DAY,
          [MonthlyType.ORDINAL_DAY]: {
            ordinalDay: OrdinalDay.FIRST,
            ordinalDayType: OrdinalDayType.WORKDAY,
          },
        },
        repeatEndMode: RepeatEndMode.FOREVER,
        repeatStartDate: '2023-06-01',
      };

      // 测试6月1日（周四，6月第一个工作日）
      const firstWorkday = dayjs('2023-06-01');
      expect(isValidDate(firstWorkday, repeat)).toBe(true);

      // 测试6月2日（周五，不是第一个工作日）
      const notFirstWorkday = dayjs('2023-06-02');
      expect(isValidDate(notFirstWorkday, repeat)).toBe(false);
    });

    it('应该验证休息日类型的日期', () => {
      const repeat: Repeat = {
        repeatMode: RepeatMode.MONTHLY,
        repeatConfig: {
          monthlyType: MonthlyType.ORDINAL_DAY,
          [MonthlyType.ORDINAL_DAY]: {
            ordinalDay: OrdinalDay.LAST,
            ordinalDayType: OrdinalDayType.REST_DAY,
          },
        },
        repeatEndMode: RepeatEndMode.FOREVER,
        repeatStartDate: '2023-06-01',
      };

      // 测试6月25日（周日，6月最后一个休息日）
      const lastRestDay = dayjs('2023-06-25');
      expect(isValidDate(lastRestDay, repeat)).toBe(true);

      // 测试6月24日（周六，不是最后一个休息日）
      const notLastRestDay = dayjs('2023-06-24');
      expect(isValidDate(notLastRestDay, repeat)).toBe(false);
    });
  });
});
