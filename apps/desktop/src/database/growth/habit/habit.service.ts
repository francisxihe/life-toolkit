import { HabitStatus, HabitDifficulty } from "@life-toolkit/enum";
import { HabitRepository } from "./habit.repository";
import {
  HabitService as BusinessHabitService,
  CreateHabitDto,
  UpdateHabitDto,
  HabitListFilterDto,
  HabitPageFilterDto,
  HabitDto,
} from "@life-toolkit/business-server";

export class HabitService {
  private service: BusinessHabitService;

  constructor() {
    const repo = new HabitRepository();
    this.service = new BusinessHabitService(repo);
  }

  // 兼容旧命名：createHabit -> create
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
    goalIds?: string[];
  }): Promise<HabitDto> {
    return this.create(habitData as any);
  }

  async create(habitData: {
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
    goalIds?: string[];
  }): Promise<HabitDto> {
    const dto: CreateHabitDto = {
      name: habitData.name,
      description: habitData.description,
      importance: habitData.importance,
      tags: habitData.tags,
      difficulty: habitData.difficulty as any,
      startDate: habitData.startDate,
      targetDate: habitData.targetDate,
      goalIds: habitData.goalIds,
    } as any;
    return await this.service.create(dto);
  }

  async findById(id: string): Promise<HabitDto> {
    return await this.service.findById(id);
  }

  async findByIdWithRelations(id: string): Promise<HabitDto> {
    return await this.service.findByIdWithRelations(id);
  }

  async findAll(): Promise<HabitDto[]> {
    return await this.service.findAll({} as HabitListFilterDto);
  }

  async findActiveHabits(): Promise<HabitDto[]> {
    return await this.service.findAll({ status: HabitStatus.ACTIVE } as any);
  }

  async findByStatus(status: HabitStatus): Promise<HabitDto[]> {
    return await this.service.findAll({ status } as any);
  }

  async findByGoalId(goalId: string): Promise<HabitDto[]> {
    return await this.service.findByGoalId(goalId);
  }

  async update(id: string, data: any): Promise<HabitDto> {
    const dto: UpdateHabitDto = {
      name: data.name,
      description: data.description,
      importance: data.importance,
      tags: data.tags,
      difficulty: data.difficulty as any,
      startDate: data.startDate,
      targetDate: data.targetDate,
      status: data.status as any,
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
      completedCount: data.completedCount,
      goalIds: data.goalIds,
    } as any;
    return await this.service.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }

  async updateStreak(id: string, completed: boolean): Promise<void> {
    await this.service.updateStreak(id, completed);
  }

  async getHabitTodos(id: string) {
    return await this.service.getHabitTodos(id);
  }

  async getHabitAnalytics(id: string) {
    return await this.service.getHabitAnalytics(id);
  }

  // 兼容旧统计：复用业务聚合并计算 daysActive
  async getHabitStatistics(id: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    completedCount: number;
    completionRate: number;
    daysActive: number;
  } | null> {
    const habit = await this.service.findById(id);
    if (!habit) return null as any;
    const analytics = await this.service.getHabitAnalytics(id);
    const startDate = (habit as any).startDate as Date | undefined;
    const daysActive = startDate
      ? Math.ceil(
          (new Date().getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
    return {
      currentStreak: (habit as any).currentStreak || 0,
      longestStreak: (habit as any).longestStreak || 0,
      completedCount: analytics.completedTodos || 0,
      completionRate: Math.round((analytics.completionRate || 0) * 100) / 100,
      daysActive,
    };
  }

  async getOverallStatistics(): Promise<{
    totalHabits: number;
    activeHabits: number;
    pausedHabits: number;
    completedHabits: number;
    averageStreak: number;
  }> {
    const list = await this.service.findAll({} as HabitListFilterDto);
    const totalHabits = list.length;
    const activeHabits = list.filter(
      (h: any) => h.status === HabitStatus.ACTIVE
    ).length;
    const pausedHabits = list.filter(
      (h: any) => h.status === HabitStatus.PAUSED
    ).length;
    const completedHabits = list.filter(
      (h: any) => h.status === HabitStatus.COMPLETED
    ).length;
    const totalStreak = list.reduce(
      (sum: number, h: any) => sum + (h.currentStreak || 0),
      0
    );
    const averageStreak =
      totalHabits > 0 ? Math.round((totalStreak / totalHabits) * 100) / 100 : 0;
    return {
      totalHabits,
      activeHabits,
      pausedHabits,
      completedHabits,
      averageStreak,
    };
  }

  async page(
    pageNum: number,
    pageSize: number
  ): Promise<{
    data: HabitDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const res = await this.service.page({
      pageNum,
      pageSize,
    } as unknown as HabitPageFilterDto);
    return {
      data: res.list ?? [],
      total: res.total,
      pageNum,
      pageSize,
    } as any;
  }

  async list(filter?: {
    status?: HabitStatus;
    difficulty?: HabitDifficulty;
    importance?: number;
    keyword?: string;
    startDateStart?: string;
    startDateEnd?: string;
    targetDateStart?: string;
    targetDateEnd?: string;
    goalId?: string;
  }): Promise<HabitDto[]> {
    const f: any = {} as HabitListFilterDto;
    if (!filter) return await this.service.findAll(f);
    if (filter.status !== undefined) f.status = filter.status as any;
    if (filter.difficulty !== undefined)
      f.difficulty = filter.difficulty as any;
    if (filter.importance !== undefined)
      (f as any).importance = filter.importance;
    if (filter.keyword) (f as any).keyword = filter.keyword;
    if (filter.startDateStart)
      (f as any).startDateStart = filter.startDateStart;
    if (filter.startDateEnd) (f as any).startDateEnd = filter.startDateEnd;
    if (filter.targetDateStart)
      (f as any).targetDateStart = filter.targetDateStart;
    if (filter.targetDateEnd) (f as any).targetDateEnd = filter.targetDateEnd;
    if (filter.goalId) (f as any).goalId = filter.goalId;
    return await this.service.findAll(f);
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
      targetDate: new Date(),
    });
  }
}

export const habitService = new HabitService();
