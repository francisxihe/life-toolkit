import { Repository } from "typeorm";
import { BaseService } from "./base.service";
import { Habit, HabitStatus, HabitDifficulty } from "../entities/habit.entity";
import { AppDataSource } from "../database.config";

export class HabitService extends BaseService<Habit> {
  constructor() {
    super(AppDataSource.getRepository(Habit));
  }

  async createHabit(habitData: {
    name: string;
    status?: HabitStatus;
    description?: string;
    difficulty?: HabitDifficulty;
    startDate?: Date;
    targetDate?: Date;
    importance?: number;
    tags?: string[];
    currentStreak?: number;
    longestStreak?: number;
    completedCount?: number;
  }): Promise<Habit> {
    return await this.create({
      ...habitData,
      status: habitData.status || HabitStatus.ACTIVE,
      difficulty: habitData.difficulty || HabitDifficulty.MEDIUM,
      currentStreak: habitData.currentStreak || 0,
      longestStreak: habitData.longestStreak || 0,
      completedCount: habitData.completedCount || 0,
    });
  }

  async findByStatus(status: HabitStatus): Promise<Habit[]> {
    return await this.repository.find({
      where: { status },
      relations: ['goals', 'todos'],
    });
  }

  async findByDifficulty(difficulty: HabitDifficulty): Promise<Habit[]> {
    return await this.repository.find({
      where: { difficulty },
      relations: ['goals', 'todos'],
    });
  }

  async findActiveHabits(): Promise<Habit[]> {
    return await this.findByStatus(HabitStatus.ACTIVE);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Habit[]> {
    return await this.repository
      .createQueryBuilder('habit')
      .leftJoinAndSelect('habit.goals', 'goals')
      .leftJoinAndSelect('habit.todos', 'todos')
      .where('habit.startDate >= :startDate', { startDate })
      .andWhere('(habit.targetDate IS NULL OR habit.targetDate <= :endDate)', { endDate })
      .orderBy('habit.startDate', 'ASC')
      .getMany();
  }

  async updateStreak(id: string, completed: boolean): Promise<void> {
    const habit = await this.findById(id);
    if (!habit) return;

    const updateData: Partial<Habit> = {};

    if (completed) {
      updateData.currentStreak = (habit.currentStreak || 0) + 1;
      updateData.completedCount = (habit.completedCount || 0) + 1;
      
      // 更新最长连续天数
      if (updateData.currentStreak > (habit.longestStreak || 0)) {
        updateData.longestStreak = updateData.currentStreak;
      }
    } else {
      updateData.currentStreak = 0;
    }

    await this.update(id, updateData);
  }

  async getHabitStatistics(id: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    completedCount: number;
    completionRate: number;
    daysActive: number;
  } | null> {
    const habit = await this.findById(id);
    if (!habit) return null;

    const daysActive = habit.startDate 
      ? Math.ceil((new Date().getTime() - habit.startDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    const completionRate = daysActive > 0 
      ? ((habit.completedCount || 0) / daysActive) * 100
      : 0;

    return {
      currentStreak: habit.currentStreak || 0,
      longestStreak: habit.longestStreak || 0,
      completedCount: habit.completedCount || 0,
      completionRate: Math.round(completionRate * 100) / 100,
      daysActive,
    };
  }

  async findHabitsNeedingAttention(): Promise<Habit[]> {
    // 查找当前连续天数为0且状态为活跃的习惯
    return await this.repository
      .createQueryBuilder('habit')
      .leftJoinAndSelect('habit.goals', 'goals')
      .leftJoinAndSelect('habit.todos', 'todos')
      .where('habit.status = :status', { status: HabitStatus.ACTIVE })
      .andWhere('habit.currentStreak = 0')
      .orderBy('habit.updatedAt', 'ASC')
      .getMany();
  }

  async findTopPerformingHabits(limit: number = 10): Promise<Habit[]> {
    return await this.repository
      .createQueryBuilder('habit')
      .leftJoinAndSelect('habit.goals', 'goals')
      .leftJoinAndSelect('habit.todos', 'todos')
      .where('habit.status = :status', { status: HabitStatus.ACTIVE })
      .orderBy('habit.longestStreak', 'DESC')
      .addOrderBy('habit.currentStreak', 'DESC')
      .limit(limit)
      .getMany();
  }

  async pauseHabit(id: string): Promise<void> {
    await this.update(id, { status: HabitStatus.PAUSED });
  }

  async resumeHabit(id: string): Promise<void> {
    await this.update(id, { status: HabitStatus.ACTIVE });
  }

  async completeHabit(id: string): Promise<void> {
    await this.update(id, { 
      status: HabitStatus.COMPLETED,
      targetDate: new Date()
    });
  }

  async getOverallStatistics(): Promise<{
    totalHabits: number;
    activeHabits: number;
    pausedHabits: number;
    completedHabits: number;
    averageStreak: number;
  }> {
    const [total, active, paused, completed] = await Promise.all([
      this.count(),
      this.repository.count({ where: { status: HabitStatus.ACTIVE } }),
      this.repository.count({ where: { status: HabitStatus.PAUSED } }),
      this.repository.count({ where: { status: HabitStatus.COMPLETED } }),
    ]);

    // 计算平均连续天数
    const habits = await this.repository.find();
    const totalStreak = habits.reduce((sum, habit) => sum + (habit.currentStreak || 0), 0);
    const averageStreak = habits.length > 0 ? totalStreak / habits.length : 0;

    return {
      totalHabits: total,
      activeHabits: active,
      pausedHabits: paused,
      completedHabits: completed,
      averageStreak: Math.round(averageStreak * 100) / 100,
    };
  }

  async page(pageNum: number, pageSize: number): Promise<{
    data: Habit[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const [data, total] = await this.repository.findAndCount({
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
      relations: ['goals', 'todos'],
    });

    return {
      data,
      total,
      pageNum,
      pageSize,
    };
  }

  async list(): Promise<Habit[]> {
    return await this.findAll();
  }
}

export const habitService = new HabitService();