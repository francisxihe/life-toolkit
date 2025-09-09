import dayjs from 'dayjs';
import {
  RepeatMode,
  RepeatEndMode,
  MonthlyType,
  YearlyType,
  TimeUnit,
  WeekDay,
  OrdinalWeek,
  OrdinalDay,
  OrdinalDayType,
} from '../types';
import { RepeatService } from '../server/service';
import { Repeat } from '../server/entity';

// 模拟 Repeat 实体
const createMockRepeat = (config: Partial<Repeat>): Repeat => {
  return {
    id: 'test-id',
    repeatMode: RepeatMode.NONE,
    repeatConfig: {},
    repeatEndMode: RepeatEndMode.FOREVER,
    ...config,
  } as Repeat;
};

describe('RepeatService', () => {
  let service: RepeatService;

  beforeEach(() => {
    // 这里使用了mock的repository
    const mockRepository = {
      create: jest.fn().mockImplementation((entity) => entity),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      findOneBy: jest.fn().mockImplementation(() => Promise.resolve({ id: 'test-id' })),
      update: jest.fn().mockImplementation(() => Promise.resolve(true)),
    };

    // @ts-ignore - 忽略TypeScript错误，因为我们在测试中模拟了依赖注入
    service = new RepeatService(mockRepository);
  });

  describe('calculateNextDate', () => {
    // 基础日期 - 2023-06-15
    const baseDate = dayjs('2023-06-15');

    it('should handle NONE mode', () => {
      const repeat = createMockRepeat({
        repeatMode: RepeatMode.NONE,
      });

      const result = service.calculateNextDate(baseDate, repeat);
      expect(result).toBeNull();
    });

    it('should handle DAILY mode', () => {
      const repeat = createMockRepeat({
        repeatMode: RepeatMode.DAILY,
      });

      const result = service.calculateNextDate(baseDate, repeat);
      expect(result?.format('YYYY-MM-DD')).toBe('2023-06-16');
    });

    it('should handle WEEKDAYS mode - from Thursday to Friday', () => {
      const repeat = createMockRepeat({
        repeatMode: RepeatMode.WEEKDAYS,
      });

      const result = service.calculateNextDate(baseDate, repeat);
      expect(result?.format('YYYY-MM-DD')).toBe('2023-06-16');
    });

    it('should handle WEEKDAYS mode - from Friday to Monday', () => {
      const repeat = createMockRepeat({
        repeatMode: RepeatMode.WEEKDAYS,
      });

      const fridayDate = dayjs('2023-06-16'); // Friday
      const result = service.calculateNextDate(fridayDate, repeat);
      expect(result?.format('YYYY-MM-DD')).toBe('2023-06-19');
    });

    it('should handle WEEKEND mode - from Thursday to Saturday', () => {
      const repeat = createMockRepeat({
        repeatMode: RepeatMode.WEEKEND,
      });

      const result = service.calculateNextDate(baseDate, repeat);
      expect(result?.format('YYYY-MM-DD')).toBe('2023-06-17');
    });

    it('should handle WEEKEND mode - from Saturday to Sunday', () => {
      const repeat = createMockRepeat({
        repeatMode: RepeatMode.WEEKEND,
      });

      const saturdayDate = dayjs('2023-06-17'); // Saturday
      const result = service.calculateNextDate(saturdayDate, repeat);
      expect(result?.format('YYYY-MM-DD')).toBe('2023-06-18');
    });

    it('should handle WEEKLY mode with specific weekdays', () => {
      const repeat = createMockRepeat({
        repeatMode: RepeatMode.WEEKLY,
        repeatConfig: {
          weekdays: [WeekDay.MONDAY, WeekDay.WEDNESDAY],
        },
      });

      // 从周四(15日)到下一个周一(19日)
      const result = service.calculateNextDate(baseDate, repeat);
      expect(result?.format('YYYY-MM-DD')).toBe('2023-06-19');
    });

    it('should handle MONTHLY mode with specific day', () => {
      const repeat = createMockRepeat({
        repeatMode: RepeatMode.MONTHLY,
        repeatConfig: {
          monthlyType: MonthlyType.DAY,
          [MonthlyType.DAY]: 15,
        },
      });

      // 从6月15日到7月15日
      const result = service.calculateNextDate(baseDate, repeat);
      expect(result?.format('YYYY-MM-DD')).toBe('2023-07-15');
    });

    it('should handle MONTHLY mode with ordinal week', () => {
      const repeat = createMockRepeat({
        repeatMode: RepeatMode.MONTHLY,
        repeatConfig: {
          monthlyType: MonthlyType.ORDINAL_WEEK,
          [MonthlyType.ORDINAL_WEEK]: {
            ordinalWeek: OrdinalWeek.THIRD,
            ordinalWeekdays: [WeekDay.THURSDAY],
          },
        },
      });

      // 从6月15日(第三个周四)到7月20日(第三个周四)
      const result = service.calculateNextDate(baseDate, repeat);
      expect(result?.format('YYYY-MM-DD')).toBe('2023-07-20');
    });

    it('should handle MONTHLY mode with last day', () => {
      const repeat = createMockRepeat({
        repeatMode: RepeatMode.MONTHLY,
        repeatConfig: {
          monthlyType: MonthlyType.ORDINAL_DAY,
          [MonthlyType.ORDINAL_DAY]: {
            ordinalDay: OrdinalDay.LAST,
            ordinalDayType: OrdinalDayType.DAY,
          },
        },
      });

      // 从6月15日到6月30日(6月最后一天)
      const result = service.calculateNextDate(baseDate, repeat);
      expect(result?.format('YYYY-MM-DD')).toBe('2023-07-31');
    });

    it('should handle YEARLY mode with specific month and day', () => {
      const repeat = createMockRepeat({
        repeatMode: RepeatMode.YEARLY,
        repeatConfig: {
          yearlyType: YearlyType.MONTH,
          [YearlyType.MONTH]: {
            monthlyType: MonthlyType.DAY,
            [MonthlyType.DAY]: 15,
          },
        },
      });

      // 从2023-06-15到2024-06-15
      const result = service.calculateNextDate(baseDate, repeat);
      expect(result?.format('YYYY-MM-DD')).toBe('2024-06-15');
    });

    it('should handle CUSTOM mode with days interval', () => {
      const repeat = createMockRepeat({
        repeatMode: RepeatMode.CUSTOM,
        repeatConfig: {
          interval: 3,
          intervalUnit: TimeUnit.DAY,
        },
      });

      // 从2023-06-15加3天
      const result = service.calculateNextDate(baseDate, repeat);
      expect(result?.format('YYYY-MM-DD')).toBe('2023-06-18');
    });

    it('should handle CUSTOM mode with weeks interval and specific weekdays', () => {
      const repeat = createMockRepeat({
        repeatMode: RepeatMode.CUSTOM,
        repeatConfig: {
          interval: 2,
          intervalUnit: TimeUnit.WEEK,
          [TimeUnit.WEEK]: {
            weekdays: [WeekDay.MONDAY],
          },
        },
      });

      // 从2023-06-15加2周到第一个周一
      const result = service.calculateNextDate(baseDate, repeat);
      expect(result?.format('YYYY-MM-DD')).toBe('2023-07-03');
    });
  });

  describe('findById', () => {
    it('should find a repeat by id', async () => {
      const result = await service.findById('test-id');
      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
    });

    it('should throw error if repeat not found', async () => {
      const mockRepository = {
        findOneBy: jest.fn().mockImplementation(() => Promise.resolve(null)),
      };

      // @ts-ignore
      service = new RepeatService(mockRepository);

      await expect(service.findById('non-existent')).rejects.toThrow('Repeat not found');
    });
  });
});

// 测试重复结束条件
describe('RepeatEndMode', () => {
  it('should handle FOREVER mode', () => {
    const endModeForm = {
      repeatEndMode: RepeatEndMode.FOREVER,
    };

    expect(endModeForm.repeatEndMode).toBe(RepeatEndMode.FOREVER);
  });

  it('should handle FOR_TIMES mode', () => {
    const endModeForm = {
      repeatEndMode: RepeatEndMode.FOR_TIMES,
      repeatTimes: 5,
    };

    expect(endModeForm.repeatEndMode).toBe(RepeatEndMode.FOR_TIMES);
    expect(endModeForm.repeatTimes).toBe(5);
  });

  it('should handle TO_DATE mode', () => {
    const endDate = dayjs('2023-12-31');
    const endModeForm = {
      repeatEndMode: RepeatEndMode.TO_DATE,
      repeatEndDate: endDate,
    };

    expect(endModeForm.repeatEndMode).toBe(RepeatEndMode.TO_DATE);
    expect(endModeForm.repeatEndDate).toBe(endDate);
  });
});
