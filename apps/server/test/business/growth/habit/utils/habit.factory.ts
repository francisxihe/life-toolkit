import { HabitStatus, HabitDifficulty } from '../../../../../src/business/growth/habit/entities/habit.entity';
import type { 
  Habit, 
  HabitLogVo, 
  CreateHabitVo, 
  UpdateHabitVo, 
  CreateHabitLogVo, 
  UpdateHabitLogVo 
} from '@life-toolkit/vo';

/**
 * 习惯测试数据工厂
 */
export class HabitTestFactory {
  /**
   * 创建基础的CreateHabitVo
   */
  static createBasicHabitVo(overrides?: Partial<Habit.CreateHabitVo>): Habit.CreateHabitVo {
    return {
      name: '每天阅读30分钟',
      description: '培养阅读习惯，提升知识储备',
      importance: 4,
      tags: ['学习', '阅读'],
      difficulty: HabitDifficulty.MEDIUM,
      ...overrides,
    };
  }

  /**
   * 创建最小化的CreateHabitVo（只包含必需字段）
   */
  static createMinimalHabitVo(overrides?: Partial<Habit.CreateHabitVo>): Habit.CreateHabitVo {
    return {
      name: '简单习惯',
      ...overrides,
    };
  }

  /**
   * 创建完整的HabitVo
   */
  static createFullHabitVo(overrides?: Partial<Habit.HabitVo>): Habit.HabitVo {
    const now = new Date();
    return {
      id: 'habit-1',
      name: '每天阅读30分钟',
      status: HabitStatus.ACTIVE,
      description: '培养阅读习惯，提升知识储备',
      importance: 4,
      tags: ['学习', '阅读'],
      difficulty: HabitDifficulty.MEDIUM,
      startDate: now,
      currentStreak: 5,
      longestStreak: 10,
      completedCount: 25,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  /**
   * 创建UpdateHabitVo
   */
  static createUpdateHabitVo(overrides?: Partial<Habit.UpdateHabitVo>): Habit.UpdateHabitVo {
    return {
      name: '更新后的习惯名称',
      importance: 5,
      description: '更新后的描述',
      ...overrides,
    };
  }

  /**
   * 创建CreateHabitLogVo
   */
  static createHabitLogVo(overrides?: Partial<Habit.CreateHabitLogVo>): Habit.CreateHabitLogVo {
    return {
      habitId: 'habit-1',
      logDate: new Date(),
      completionScore: 2,
      note: '今天完成得很好',
      mood: 4,
      ...overrides,
    };
  }

  /**
   * 创建完整的HabitLogVo
   */
  static createFullHabitLogVo(overrides?: Partial<Habit.HabitLogVo>): Habit.HabitLogVo {
    const now = new Date();
    return {
      id: 'log-1',
      habitId: 'habit-1',
      logDate: now,
      completionScore: 2,
      note: '今天完成得很好',
      mood: 4,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  /**
   * 创建多个习惯数据
   */
  static createMultipleHabits(count: number, baseOverrides?: Partial<Habit.HabitVo>): Habit.HabitVo[] {
    return Array.from({ length: count }, (_, index) =>
      this.createFullHabitVo({
        id: `habit-${index + 1}`,
        name: `习惯${index + 1}`,
        importance: (index % 5) + 1,
        ...baseOverrides,
      })
    );
  }

  /**
   * 创建不同状态的习惯
   */
  static createHabitsWithDifferentStatuses(): Habit.HabitVo[] {
    return [
      this.createFullHabitVo({ id: 'habit-active', name: '活跃习惯', status: HabitStatus.ACTIVE }),
      this.createFullHabitVo({ id: 'habit-paused', name: '暂停习惯', status: HabitStatus.PAUSED }),
      this.createFullHabitVo({ id: 'habit-completed', name: '完成习惯', status: HabitStatus.COMPLETED }),
      this.createFullHabitVo({ id: 'habit-abandoned', name: '放弃习惯', status: HabitStatus.ABANDONED }),
    ];
  }

  /**
   * 创建不同难度的习惯
   */
  static createHabitsWithDifferentDifficulties(): Habit.HabitVo[] {
    return [
      this.createFullHabitVo({ id: 'habit-easy', name: '简单习惯', difficulty: HabitDifficulty.EASY }),
      this.createFullHabitVo({ id: 'habit-medium', name: '中等习惯', difficulty: HabitDifficulty.MEDIUM }),
      this.createFullHabitVo({ id: 'habit-hard', name: '困难习惯', difficulty: HabitDifficulty.HARD }),
    ];
  }

  /**
   * 创建带有不同标签的习惯
   */
  static createHabitsWithDifferentTags(): Habit.HabitVo[] {
    return [
      this.createFullHabitVo({ id: 'habit-learning', name: '学习习惯', tags: ['学习', '阅读', '知识'] }),
      this.createFullHabitVo({ id: 'habit-health', name: '健康习惯', tags: ['健康', '运动', '锻炼'] }),
      this.createFullHabitVo({ id: 'habit-mindfulness', name: '正念习惯', tags: ['正念', '冥想', '心理健康'] }),
      this.createFullHabitVo({ id: 'habit-productivity', name: '效率习惯', tags: ['效率', '工作', '时间管理'] }),
    ];
  }

  /**
   * 创建习惯日志序列（连续多天）
   */
  static createHabitLogSequence(
    habitId: string,
    days: number,
    startDate?: Date
  ): Habit.HabitLogVo[] {
    const start = startDate || new Date();
    return Array.from({ length: days }, (_, index) => {
      const logDate = new Date(start);
      logDate.setDate(start.getDate() + index);
      
      return this.createFullHabitLogVo({
        id: `log-${habitId}-${index + 1}`,
        habitId,
        logDate,
        completionScore: Math.random() > 0.2 ? 2 : (Math.random() > 0.5 ? 1 : 0), // 80%完成，10%部分完成，10%未完成
        mood: Math.floor(Math.random() * 5) + 1,
        note: `第${index + 1}天的记录`,
      });
    });
  }

  /**
   * 创建无效的习惯数据（用于测试验证）
   */
  static createInvalidHabitVo(): Partial<Habit.CreateHabitVo> {
    return {
      name: '', // 空名称
      importance: 10, // 超出范围
      tags: Array(20).fill('tag'), // 过多标签
    };
  }

  /**
   * 创建边界值测试数据
   */
  static createBoundaryTestData() {
    return {
      minImportance: this.createBasicHabitVo({ importance: 1 }),
      maxImportance: this.createBasicHabitVo({ importance: 5 }),
      longName: this.createBasicHabitVo({ name: 'a'.repeat(100) }),
      longDescription: this.createBasicHabitVo({ description: 'a'.repeat(500) }),
      maxTags: this.createBasicHabitVo({ tags: Array(10).fill('tag') }),
    };
  }

  /**
   * 创建分页测试数据
   */
  static createPaginationTestData(totalItems: number) {
    return {
      habits: this.createMultipleHabits(totalItems),
      pageSize: 10,
      totalPages: Math.ceil(totalItems / 10),
      firstPageExpected: Math.min(10, totalItems),
      lastPageExpected: totalItems % 10 || 10,
    };
  }

  /**
   * 创建过滤测试数据
   */
  static createFilterTestData() {
    return {
      activeHabits: this.createMultipleHabits(5, { status: HabitStatus.ACTIVE }),
      pausedHabits: this.createMultipleHabits(3, { status: HabitStatus.PAUSED }),
      readingHabits: this.createMultipleHabits(2, { name: '阅读相关习惯', tags: ['阅读'] }),
      exerciseHabits: this.createMultipleHabits(4, { name: '运动相关习惯', tags: ['运动'] }),
      highImportanceHabits: this.createMultipleHabits(3, { importance: 5 }),
      lowImportanceHabits: this.createMultipleHabits(2, { importance: 1 }),
    };
  }
} 