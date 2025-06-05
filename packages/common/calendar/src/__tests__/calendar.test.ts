import { ChineseCalendar } from '../calendar';
import { DateType } from '../types';

describe('ChineseCalendar', () => {
  let calendar: ChineseCalendar;

  beforeEach(() => {
    calendar = new ChineseCalendar();
  });

  describe('基本日期判断', () => {
    test('应该正确判断工作日', () => {
      // 2024年1月2日是工作日
      expect(calendar.isWorkday('2024-01-02')).toBe(true);
      expect(calendar.isWorkday(new Date('2024-01-02'))).toBe(true);
    });

    test('应该正确判断节假日', () => {
      // 2024年1月1日是元旦
      expect(calendar.isHoliday('2024-01-01')).toBe(true);
      expect(calendar.isWorkday('2024-01-01')).toBe(false);
    });

    test('应该正确判断周末', () => {
      // 2024年1月6日是周六
      expect(calendar.isWorkday('2024-01-06')).toBe(false);
      const dateInfo = calendar.getDateInfo('2024-01-06');
      expect(dateInfo.type).toBe(DateType.WEEKEND);
    });

    test('应该正确判断补班日', () => {
      // 2024年2月4日是春节补班日
      expect(calendar.isMakeupDay('2024-02-04')).toBe(true);
      expect(calendar.isWorkday('2024-02-04')).toBe(true);
      const dateInfo = calendar.getDateInfo('2024-02-04');
      expect(dateInfo.type).toBe(DateType.MAKEUP_DAY);
    });
  });

  describe('日期信息获取', () => {
    test('应该返回正确的日期信息', () => {
      const dateInfo = calendar.getDateInfo('2024-01-01');
      expect(dateInfo.date).toBe('2024-01-01');
      expect(dateInfo.type).toBe(DateType.HOLIDAY);
      expect(dateInfo.isWorkday).toBe(false);
      expect(dateInfo.holiday).toBeDefined();
      expect(dateInfo.holiday?.Name).toBe('元旦');
      expect(dateInfo.dayOfWeek).toBe(1); // 周一
    });

    test('应该返回工作日信息', () => {
      const dateInfo = calendar.getDateInfo('2024-01-02');
      expect(dateInfo.type).toBe(DateType.WORKDAY);
      expect(dateInfo.isWorkday).toBe(true);
      expect(dateInfo.holiday).toBeUndefined();
    });
  });

  describe('年度数据获取', () => {
    test('应该获取年度工作日', () => {
      const workdays = calendar.getWorkdaysInYear(2024);
      expect(Array.isArray(workdays)).toBe(true);
      expect(workdays.length).toBeGreaterThan(200);
      expect(workdays).toContain('2024-01-02');
      expect(workdays).not.toContain('2024-01-01'); // 元旦
    });

    test('应该获取年度非工作日', () => {
      const nonWorkdays = calendar.getNonWorkdaysInYear(2024);
      expect(Array.isArray(nonWorkdays)).toBe(true);
      expect(nonWorkdays).toContain('2024-01-01'); // 元旦
      expect(nonWorkdays).toContain('2024-01-06'); // 周六
    });

    test('应该获取年度节假日', () => {
      const holidays = calendar.getHolidaysInYear(2024);
      expect(Array.isArray(holidays)).toBe(true);
      expect(holidays.length).toBeGreaterThan(0);
      
      const newYear = holidays.find(h => h.Name === '元旦');
      expect(newYear).toBeDefined();
      expect(newYear?.StartDate).toBe('2024-01-01');
    });

    test('应该获取年度补班日', () => {
      const makeupDays = calendar.getMakeupDaysInYear(2024);
      expect(Array.isArray(makeupDays)).toBe(true);
      expect(makeupDays).toContain('2024-02-04'); // 春节补班
    });
  });

  describe('月度数据获取', () => {
    test('应该获取月度工作日', () => {
      const workdays = calendar.getWorkdaysInMonth(2024, 1);
      expect(Array.isArray(workdays)).toBe(true);
      expect(workdays).toContain('2024-01-02');
      expect(workdays).not.toContain('2024-01-01'); // 元旦
    });

    test('应该获取月度非工作日', () => {
      const nonWorkdays = calendar.getNonWorkdaysInMonth(2024, 1);
      expect(Array.isArray(nonWorkdays)).toBe(true);
      expect(nonWorkdays).toContain('2024-01-01'); // 元旦
    });
  });

  describe('统计信息', () => {
    test('应该获取年度统计信息', () => {
      const stats = calendar.getYearStatistics(2024);
      expect(stats.year).toBe(2024);
      expect(stats.totalDays).toBe(366); // 2024是闰年
      expect(stats.workdays).toBeGreaterThan(0);
      expect(stats.weekends).toBeGreaterThan(0);
      expect(stats.holidays).toBeGreaterThan(0);
      expect(stats.actualWorkdays).toBe(stats.workdays + stats.makeupDays);
    });

    test('应该获取月度统计信息', () => {
      const stats = calendar.getMonthStatistics(2024, 1);
      expect(stats.year).toBe(2024);
      expect(stats.month).toBe(1);
      expect(stats.totalDays).toBe(31);
      expect(stats.workdays).toBeGreaterThan(0);
      expect(stats.holidays).toBe(1); // 元旦
    });
  });

  describe('工作日计算', () => {
    test('应该获取下一个工作日', () => {
      // 元旦后的第一个工作日
      const nextWorkday = calendar.getNextWorkday('2024-01-01');
      expect(nextWorkday).toBe('2024-01-02');
    });

    test('应该获取上一个工作日', () => {
      // 元旦前的最后一个工作日
      const prevWorkday = calendar.getPreviousWorkday('2024-01-01');
      expect(prevWorkday).toBe('2023-12-29');
    });

    test('应该计算日期范围内的工作日天数', () => {
      const count = calendar.getWorkdaysBetween('2024-01-01', '2024-01-07');
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThan(7);
    });

    test('应该获取日期范围内的工作日', () => {
      const workdays = calendar.getWorkdaysInRange('2024-01-01', '2024-01-07');
      expect(Array.isArray(workdays)).toBe(true);
      expect(workdays).toContain('2024-01-02');
      expect(workdays).not.toContain('2024-01-01'); // 元旦
    });

    test('日期范围错误时应该抛出异常', () => {
      expect(() => {
        calendar.getWorkdaysBetween('2024-01-07', '2024-01-01');
      }).toThrow('开始日期不能晚于结束日期');
    });
  });

  describe('支持的年份', () => {
    test('应该返回支持的年份列表', () => {
      const years = calendar.getSupportedYears();
      expect(Array.isArray(years)).toBe(true);
      expect(years).toContain(2023);
      expect(years).toContain(2024);
      expect(years).toContain(2025);
    });
  });

  describe('边界情况', () => {
    test('应该处理不支持的年份', () => {
      const holidays = calendar.getHolidaysInYear(2022);
      expect(holidays).toEqual([]);
      
      const makeupDays = calendar.getMakeupDaysInYear(2022);
      expect(makeupDays).toEqual([]);
    });

    test('应该正确处理跨年的节假日', () => {
      // 2023年元旦从2022年12月31日开始
      const dateInfo = calendar.getDateInfo('2022-12-31');
      expect(dateInfo.type).toBe(DateType.HOLIDAY);
      expect(dateInfo.holiday?.Name).toBe('元旦');
    });
  });
}); 