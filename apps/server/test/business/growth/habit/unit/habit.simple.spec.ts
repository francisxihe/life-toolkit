import { Test, TestingModule } from '@nestjs/testing';
import type { Habit } from '@life-toolkit/vo';
import { HabitStatus, Difficulty } from '@life-toolkit/enum';

describe('Habit Simple Tests', () => {
  describe('Habit Entity', () => {
    it('should create a habit with basic properties', () => {
      const habit: Habit.CreateHabitVo = {
        name: '每天阅读',
        description: '培养阅读习惯',
        importance: 4,
        tags: ['学习'],
        difficulty: Difficulty.Challenger,
      };

      expect(habit.name).toBe('每天阅读');
      expect(habit.description).toBe('培养阅读习惯');
      expect(habit.importance).toBe(4);
      expect(habit.tags).toEqual(['学习']);
      expect(habit.difficulty).toBe(Difficulty.Challenger);
    });

    it('should create a habit with minimal properties', () => {
      const habit: Habit.CreateHabitVo = {
        name: '简单习惯',
      };

      expect(habit.name).toBe('简单习惯');
      expect(habit.description).toBeUndefined();
      expect(habit.importance).toBeUndefined();
      expect(habit.tags).toBeUndefined();
      expect(habit.difficulty).toBeUndefined();
    });

    it('should create a habit VO with all properties', () => {
      const habitVo: Habit.HabitVo = {
        id: 'habit-1',
        name: '每天运动',
        status: HabitStatus.ACTIVE,
        description: '保持健康',
        importance: 5,
        tags: ['健康', '运动'],
        difficulty: Difficulty.Legendary,
        startDate: '2024-01-01',
        targetDate: '2024-12-31',
        currentStreak: 7,
        longestStreak: 15,
        completedCount: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(habitVo.id).toBe('habit-1');
      expect(habitVo.name).toBe('每天运动');
      expect(habitVo.status).toBe(HabitStatus.ACTIVE);
      expect(habitVo.description).toBe('保持健康');
      expect(habitVo.importance).toBe(5);
      expect(habitVo.tags).toEqual(['健康', '运动']);
      expect(habitVo.difficulty).toBe(Difficulty.Legendary);
      expect(habitVo.currentStreak).toBe(7);
      expect(habitVo.longestStreak).toBe(15);
      expect(habitVo.completedCount).toBe(30);
    });
  });

  describe('Habit Status', () => {
    it('should have correct status values', () => {
      expect(HabitStatus.ACTIVE).toBe('active');
      expect(HabitStatus.PAUSED).toBe('paused');
      expect(HabitStatus.ABANDONED).toBe('abandoned');
    });
  });

  describe('Habit Difficulty', () => {
    it('should have correct difficulty values', () => {
      expect(Difficulty.GettingStarted).toBe('gettingStarted');
      expect(Difficulty.Challenger).toBe('challenger');
      expect(Difficulty.Legendary).toBe('legendary');
    });
  });

  describe('Update Habit VO', () => {
    it('should allow partial updates', () => {
      const updateHabit: Habit.UpdateHabitVo = {
        name: '更新的习惯名称',
        importance: 3,
      };

      expect(updateHabit.name).toBe('更新的习惯名称');
      expect(updateHabit.importance).toBe(3);
      expect(updateHabit.description).toBeUndefined();
      expect(updateHabit.status).toBeUndefined();
    });

    it('should allow status updates', () => {
      const updateHabit: Habit.UpdateHabitVo = {
        status: HabitStatus.PAUSED,
      };

      expect(updateHabit.status).toBe(HabitStatus.PAUSED);
    });
  });
}); 