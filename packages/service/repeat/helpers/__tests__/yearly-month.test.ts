import dayjs from 'dayjs';
import { calculateNextDate, isValidDate } from '../common';
import { Repeat } from '../common/types';
import { RepeatMode, RepeatEndMode, YearlyType, MonthlyType } from '@life-toolkit/service-repeat-types';

describe('年度重复月份字段测试', () => {
  const baseDate = dayjs('2023-06-15'); // 2023年6月15日

  describe('年度重复带月份限制', () => {
    it('应该计算指定月份的年度重复', () => {
      const repeat: Repeat = {
        repeatMode: RepeatMode.YEARLY,
        repeatConfig: {
          yearlyType: YearlyType.MONTH,
          [YearlyType.MONTH]: {
            month: [3, 6, 9, 12], // 每年3月、6月、9月、12月
            monthlyType: MonthlyType.DAY,
            [MonthlyType.DAY]: 15,
          },
        },
        repeatEndMode: RepeatEndMode.FOREVER,
        repeatStartDate: '2023-06-01',
      };

      const nextDate = calculateNextDate(baseDate, repeat);
      // 从6月15日开始，下一个应该是9月15日
      expect(nextDate?.format('YYYY-MM-DD')).toBe('2023-09-15');
    });

    it('应该跨年计算年度重复', () => {
      const repeat: Repeat = {
        repeatMode: RepeatMode.YEARLY,
        repeatConfig: {
          yearlyType: YearlyType.MONTH,
          [YearlyType.MONTH]: {
            month: [1, 4], // 每年1月、4月
            monthlyType: MonthlyType.DAY,
            [MonthlyType.DAY]: 10,
          },
        },
        repeatEndMode: RepeatEndMode.FOREVER,
        repeatStartDate: '2023-06-01',
      };

      const nextDate = calculateNextDate(baseDate, repeat);
      // 从6月15日开始，下一个应该是2024年1月10日
      expect(nextDate?.format('YYYY-MM-DD')).toBe('2024-01-10');
    });

    it('应该处理单个月份的年度重复', () => {
      const repeat: Repeat = {
        repeatMode: RepeatMode.YEARLY,
        repeatConfig: {
          yearlyType: YearlyType.MONTH,
          [YearlyType.MONTH]: {
            month: [12], // 每年12月
            monthlyType: MonthlyType.DAY,
            [MonthlyType.DAY]: 25,
          },
        },
        repeatEndMode: RepeatEndMode.FOREVER,
        repeatStartDate: '2023-06-01',
      };

      const nextDate = calculateNextDate(baseDate, repeat);
      // 从6月15日开始，下一个应该是12月25日
      expect(nextDate?.format('YYYY-MM-DD')).toBe('2023-12-25');
    });

    it('应该处理空月份数组（使用当前月份）', () => {
      const repeat: Repeat = {
        repeatMode: RepeatMode.YEARLY,
        repeatConfig: {
          yearlyType: YearlyType.MONTH,
          [YearlyType.MONTH]: {
            month: [], // 空数组，应该使用当前月份
            monthlyType: MonthlyType.DAY,
            [MonthlyType.DAY]: 15,
          },
        },
        repeatEndMode: RepeatEndMode.FOREVER,
        repeatStartDate: '2023-06-01',
      };

      const nextDate = calculateNextDate(baseDate, repeat);
      // 从6月15日开始，下一个应该是2024年6月15日
      expect(nextDate?.format('YYYY-MM-DD')).toBe('2024-06-15');
    });
  });

  describe('日期验证', () => {
    it('应该验证指定月份的年度重复日期', () => {
      const repeat: Repeat = {
        repeatMode: RepeatMode.YEARLY,
        repeatConfig: {
          yearlyType: YearlyType.MONTH,
          [YearlyType.MONTH]: {
            month: [3, 6, 9, 12],
            monthlyType: MonthlyType.DAY,
            [MonthlyType.DAY]: 15,
          },
        },
        repeatEndMode: RepeatEndMode.FOREVER,
        repeatStartDate: '2023-06-01',
      };

      // 测试6月15日（在指定月份中）
      const validDate = dayjs('2023-06-15');
      expect(isValidDate(validDate, repeat)).toBe(true);

      // 测试9月15日（在指定月份中）
      const validDate2 = dayjs('2023-09-15');
      expect(isValidDate(validDate2, repeat)).toBe(true);

      // 测试5月15日（不在指定月份中）
      const invalidDate = dayjs('2023-05-15');
      expect(isValidDate(invalidDate, repeat)).toBe(false);

      // 测试6月16日（月份正确但日期不对）
      const invalidDate2 = dayjs('2023-06-16');
      expect(isValidDate(invalidDate2, repeat)).toBe(false);
    });

    it('应该验证空月份数组的年度重复', () => {
      const repeat: Repeat = {
        repeatMode: RepeatMode.YEARLY,
        repeatConfig: {
          yearlyType: YearlyType.MONTH,
          [YearlyType.MONTH]: {
            month: [],
            monthlyType: MonthlyType.DAY,
            [MonthlyType.DAY]: 15,
          },
        },
        repeatEndMode: RepeatEndMode.FOREVER,
        repeatStartDate: '2023-01-01',
      };

      // 空月份数组时，任何月份的15日都应该有效
      const anyMonthDate = dayjs('2023-03-15');
      expect(isValidDate(anyMonthDate, repeat)).toBe(true);

      const anotherMonthDate = dayjs('2023-08-15');
      expect(isValidDate(anotherMonthDate, repeat)).toBe(true);

      // 但日期不对的应该无效
      const wrongDayDate = dayjs('2023-03-16');
      expect(isValidDate(wrongDayDate, repeat)).toBe(false);
    });
  });
});
