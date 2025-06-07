import dayjs from 'dayjs';
import { calculateNextDate } from '../common/calculateNextDate';
import { RepeatMode, RepeatEndMode } from '../types';
import { Repeat } from '../server/entity';

describe('工作日和节假日重复模式测试', () => {
  const createRepeat = (mode: RepeatMode): Repeat => ({
    id: 'test-id',
    repeatMode: mode,
    repeatConfig: undefined,
    repeatEndMode: RepeatEndMode.FOREVER,
    repeatEndDate: undefined,
    repeatTimes: undefined,
    repeatedTimes: undefined,
  });

  describe('工作日重复模式', () => {
    it('应该返回下一个工作日', () => {
      const repeat = createRepeat(RepeatMode.WORKDAYS);
      const currentDate = dayjs('2024-01-05'); // 2024年1月5日，周五
      
      const nextDate = calculateNextDate(currentDate, repeat);
      
      expect(nextDate).not.toBeNull();
      // 下一个工作日应该是周一（跳过周末）
      expect(nextDate!.format('YYYY-MM-DD')).toBe('2024-01-08');
    });

    it('从周三开始应该返回周四', () => {
      const repeat = createRepeat(RepeatMode.WORKDAYS);
      const currentDate = dayjs('2024-01-03'); // 2024年1月3日，周三
      
      const nextDate = calculateNextDate(currentDate, repeat);
      
      expect(nextDate).not.toBeNull();
      expect(nextDate!.format('YYYY-MM-DD')).toBe('2024-01-04');
    });
  });

  describe('节假日重复模式', () => {
    it('应该返回下一个节假日', () => {
      const repeat = createRepeat(RepeatMode.REST_DAY);
      const currentDate = dayjs('2024-01-01'); // 2024年1月1日，元旦
      
      const nextDate = calculateNextDate(currentDate, repeat);
      
      expect(nextDate).not.toBeNull();
      // 应该找到下一个节假日
      expect(nextDate!.isAfter(currentDate)).toBe(true);
    });

    it('如果找不到节假日应该返回一年后', () => {
      const repeat = createRepeat(RepeatMode.REST_DAY);
      const currentDate = dayjs('2030-01-01'); // 使用一个可能没有节假日数据的年份
      
      const nextDate = calculateNextDate(currentDate, repeat);
      
      expect(nextDate).not.toBeNull();
      // 如果找不到节假日，应该返回一年后
      expect(nextDate!.year()).toBe(2031);
    });
  });
}); 