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
  isLeapYear,
  getDaysInYear,
  getDaysInMonth,
  isSameDate,
  addDays,
  getDayOfWeek
} from '../utils';

describe('Utils', () => {
  describe('formatDate', () => {
    test('应该正确格式化日期', () => {
      const date = new Date('2024-01-01T00:00:00');
      expect(formatDate(date)).toBe('2024-01-01');
    });

    test('应该正确处理月份和日期的零填充', () => {
      const date = new Date('2024-03-05T00:00:00');
      expect(formatDate(date)).toBe('2024-03-05');
    });
  });

  describe('parseDate', () => {
    test('应该正确解析日期字符串', () => {
      const date = parseDate('2024-01-01');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // 0-based
      expect(date.getDate()).toBe(1);
    });
  });

  describe('isWeekend', () => {
    test('应该正确判断周末', () => {
      const saturday = new Date('2024-01-06T00:00:00'); // 周六
      const sunday = new Date('2024-01-07T00:00:00'); // 周日
      const monday = new Date('2024-01-08T00:00:00'); // 周一

      expect(isWeekend(saturday)).toBe(true);
      expect(isWeekend(sunday)).toBe(true);
      expect(isWeekend(monday)).toBe(false);
    });
  });

  describe('getYearStart and getYearEnd', () => {
    test('应该返回正确的年份开始和结束日期', () => {
      const start = getYearStart(2024);
      const end = getYearEnd(2024);

      expect(formatDate(start)).toBe('2024-01-01');
      expect(formatDate(end)).toBe('2024-12-31');
    });
  });

  describe('getMonthStart and getMonthEnd', () => {
    test('应该返回正确的月份开始和结束日期', () => {
      const start = getMonthStart(2024, 1);
      const end = getMonthEnd(2024, 1);

      expect(formatDate(start)).toBe('2024-01-01');
      expect(formatDate(end)).toBe('2024-01-31');
    });

    test('应该正确处理2月', () => {
      const start = getMonthStart(2024, 2);
      const end = getMonthEnd(2024, 2);

      expect(formatDate(start)).toBe('2024-02-01');
      expect(formatDate(end)).toBe('2024-02-29'); // 2024是闰年
    });
  });

  describe('isDateInRange', () => {
    test('应该正确判断日期是否在范围内', () => {
      const date = new Date('2024-01-15');
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');

      expect(isDateInRange(date, start, end)).toBe(true);
    });

    test('应该正确处理边界情况', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');

      expect(isDateInRange(start, start, end)).toBe(true);
      expect(isDateInRange(end, start, end)).toBe(true);
    });

    test('应该正确判断超出范围的日期', () => {
      const date = new Date('2024-02-01');
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');

      expect(isDateInRange(date, start, end)).toBe(false);
    });
  });

  describe('getDateRange', () => {
    test('应该返回正确的日期范围', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-03');
      const range = getDateRange(start, end);

      expect(range).toHaveLength(3);
      expect(formatDate(range[0])).toBe('2024-01-01');
      expect(formatDate(range[1])).toBe('2024-01-02');
      expect(formatDate(range[2])).toBe('2024-01-03');
    });

    test('应该处理单日范围', () => {
      const date = new Date('2024-01-01');
      const range = getDateRange(date, date);

      expect(range).toHaveLength(1);
      expect(formatDate(range[0])).toBe('2024-01-01');
    });
  });

  describe('isLeapYear', () => {
    test('应该正确判断闰年', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(1900)).toBe(false);
    });
  });

  describe('getDaysInYear', () => {
    test('应该返回正确的年份天数', () => {
      expect(getDaysInYear(2024)).toBe(366); // 闰年
      expect(getDaysInYear(2023)).toBe(365); // 平年
    });
  });

  describe('getDaysInMonth', () => {
    test('应该返回正确的月份天数', () => {
      expect(getDaysInMonth(2024, 1)).toBe(31); // 1月
      expect(getDaysInMonth(2024, 2)).toBe(29); // 2月闰年
      expect(getDaysInMonth(2023, 2)).toBe(28); // 2月平年
      expect(getDaysInMonth(2024, 4)).toBe(30); // 4月
    });
  });

  describe('isSameDate', () => {
    test('应该正确比较日期', () => {
      const date1 = new Date('2024-01-01T10:00:00');
      const date2 = new Date('2024-01-01T15:00:00');
      const date3 = new Date('2024-01-02T10:00:00');

      expect(isSameDate(date1, date2)).toBe(true); // 同一天不同时间
      expect(isSameDate(date1, date3)).toBe(false); // 不同天
    });
  });

  describe('addDays', () => {
    test('应该正确添加天数', () => {
      const date = new Date('2024-01-01');
      const newDate = addDays(date, 5);

      expect(formatDate(newDate)).toBe('2024-01-06');
    });

    test('应该正确处理负数天数', () => {
      const date = new Date('2024-01-06');
      const newDate = addDays(date, -5);

      expect(formatDate(newDate)).toBe('2024-01-01');
    });

    test('应该正确处理跨月', () => {
      const date = new Date('2024-01-30');
      const newDate = addDays(date, 5);

      expect(formatDate(newDate)).toBe('2024-02-04');
    });
  });

  describe('getDayOfWeek', () => {
    test('应该返回正确的星期几', () => {
      const sunday = new Date('2024-01-07'); // 周日
      const monday = new Date('2024-01-08'); // 周一
      const saturday = new Date('2024-01-06'); // 周六

      expect(getDayOfWeek(sunday)).toBe(0);
      expect(getDayOfWeek(monday)).toBe(1);
      expect(getDayOfWeek(saturday)).toBe(6);
    });
  });
}); 