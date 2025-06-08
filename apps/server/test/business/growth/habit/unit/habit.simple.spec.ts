import { HabitTestFactory } from '../utils/habit.factory';
import { HabitTestUtils } from '../utils/habit.test-utils';
import { HabitStatus, HabitFrequency, HabitDifficulty } from '../../../../../src/business/growth/habit/entities/habit.entity';

describe('Habit Simple Tests', () => {
  describe('HabitTestFactory', () => {
    it('should create basic habit VO', () => {
      const habit = HabitTestFactory.createBasicHabitVo();
      
      expect(habit).toBeDefined();
      expect(habit.name).toBe('每天阅读30分钟');
      expect(habit.importance).toBe(4);
      expect(habit.frequency).toBe(HabitFrequency.DAILY);
      expect(habit.difficulty).toBe(HabitDifficulty.MEDIUM);
      expect(habit.tags).toEqual(['学习', '阅读']);
    });

    it('should create habit with overrides', () => {
      const habit = HabitTestFactory.createBasicHabitVo({
        name: '自定义习惯',
        importance: 5,
      });
      
      expect(habit.name).toBe('自定义习惯');
      expect(habit.importance).toBe(5);
    });

    it('should create minimal habit VO', () => {
      const habit = HabitTestFactory.createMinimalHabitVo();
      
      expect(habit).toBeDefined();
      expect(habit.name).toBe('简单习惯');
    });

    it('should create full habit VO', () => {
      const habit = HabitTestFactory.createFullHabitVo();
      
      HabitTestUtils.expectHabitStructure(habit);
      expect(habit.id).toBe('habit-1');
      expect(habit.status).toBe(HabitStatus.ACTIVE);
      expect(habit.currentStreak).toBe(5);
      expect(habit.longestStreak).toBe(10);
    });

    it('should create multiple habits', () => {
      const habits = HabitTestFactory.createMultipleHabits(3);
      
      expect(habits).toHaveLength(3);
      habits.forEach((habit, index) => {
        expect(habit.id).toBe(`habit-${index + 1}`);
        expect(habit.name).toBe(`习惯${index + 1}`);
        HabitTestUtils.expectHabitStructure(habit);
      });
    });

    it('should create habits with different statuses', () => {
      const habits = HabitTestFactory.createHabitsWithDifferentStatuses();
      
      expect(habits).toHaveLength(4);
      expect(habits[0].status).toBe(HabitStatus.ACTIVE);
      expect(habits[1].status).toBe(HabitStatus.PAUSED);
      expect(habits[2].status).toBe(HabitStatus.COMPLETED);
      expect(habits[3].status).toBe(HabitStatus.ABANDONED);
    });

    it('should create habit log VO', () => {
      const log = HabitTestFactory.createHabitLogVo();
      
      expect(log).toBeDefined();
      expect(log.habitId).toBe('habit-1');
      expect(log.completionScore).toBe(2);
      expect(log.mood).toBe(4);
      expect(log.note).toBe('今天完成得很好');
    });

    it('should create habit log sequence', () => {
      const logs = HabitTestFactory.createHabitLogSequence('habit-1', 7);
      
      expect(logs).toHaveLength(7);
      logs.forEach((log, index) => {
        expect(log.habitId).toBe('habit-1');
        expect(log.id).toBe(`log-habit-1-${index + 1}`);
        HabitTestUtils.expectHabitLogStructure(log);
      });
    });
  });

  describe('HabitTestUtils', () => {
    it('should validate habit structure', () => {
      const habit = HabitTestFactory.createFullHabitVo();
      
      expect(() => {
        HabitTestUtils.expectHabitStructure(habit);
      }).not.toThrow();
    });

    it('should validate habit log structure', () => {
      const log = HabitTestFactory.createFullHabitLogVo();
      
      expect(() => {
        HabitTestUtils.expectHabitLogStructure(log);
      }).not.toThrow();
    });

    it('should validate page structure', () => {
      const pageResult = {
        list: HabitTestFactory.createMultipleHabits(5),
        total: 5,
        pageNum: 1,
        pageSize: 10,
      };
      
      expect(() => {
        HabitTestUtils.expectPageStructure(pageResult);
      }).not.toThrow();
    });

    it('should create date range', () => {
      const { start, end } = HabitTestUtils.createDateRange(7);
      
      expect(end.getTime() - start.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it('should compare dates only', () => {
      const date1 = new Date('2024-01-01T10:00:00');
      const date2 = new Date('2024-01-01T15:30:00');
      const date3 = new Date('2024-01-02T10:00:00');
      
      expect(HabitTestUtils.compareDatesOnly(date1, date2)).toBe(true);
      expect(HabitTestUtils.compareDatesOnly(date1, date3)).toBe(false);
    });

    it('should validate status transitions', () => {
      expect(HabitTestUtils.validateStatusTransition(
        HabitStatus.ACTIVE, 
        HabitStatus.PAUSED
      )).toBe(true);
      
      expect(HabitTestUtils.validateStatusTransition(
        HabitStatus.COMPLETED, 
        HabitStatus.PAUSED
      )).toBe(false);
    });

    it('should generate random test data', () => {
      const data = HabitTestUtils.generateRandomTestData(5);
      
      expect(data).toHaveLength(5);
      data.forEach((item, index) => {
        expect(item.id).toBe(`habit-${index + 1}`);
        expect(item.importance).toBeGreaterThanOrEqual(1);
        expect(item.importance).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('Boundary Tests', () => {
    it('should handle boundary values', () => {
      const boundaryData = HabitTestFactory.createBoundaryTestData();
      
      expect(boundaryData.minImportance.importance).toBe(1);
      expect(boundaryData.maxImportance.importance).toBe(5);
      expect(boundaryData.longName.name).toHaveLength(100);
      expect(boundaryData.maxTags.tags).toHaveLength(10);
    });

    it('should handle pagination test data', () => {
      const paginationData = HabitTestFactory.createPaginationTestData(25);
      
      expect(paginationData.habits).toHaveLength(25);
      expect(paginationData.totalPages).toBe(3);
      expect(paginationData.firstPageExpected).toBe(10);
      expect(paginationData.lastPageExpected).toBe(5);
    });

    it('should handle filter test data', () => {
      const filterData = HabitTestFactory.createFilterTestData();
      
      expect(filterData.activeHabits).toHaveLength(5);
      expect(filterData.pausedHabits).toHaveLength(3);
      expect(filterData.readingHabits).toHaveLength(2);
      expect(filterData.exerciseHabits).toHaveLength(4);
    });
  });

  describe('Performance Tests', () => {
    it('should create large dataset efficiently', async () => {
      const { result, executionTime } = await HabitTestUtils.measurePerformance(
        async () => HabitTestFactory.createMultipleHabits(1000),
        500 // 最大500ms
      );
      
      expect(result).toHaveLength(1000);
      expect(executionTime).toBeLessThan(500);
    });

    it('should create habit log sequence efficiently', async () => {
      const { result, executionTime } = await HabitTestUtils.measurePerformance(
        async () => HabitTestFactory.createHabitLogSequence('habit-1', 365),
        1000 // 最大1秒
      );
      
      expect(result).toHaveLength(365);
      expect(executionTime).toBeLessThan(1000);
    });
  });
}); 