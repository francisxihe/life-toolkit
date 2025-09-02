import { HabitRepository } from "./habit.repository";
import {
  CreateHabitDto,
  UpdateHabitDto,
  HabitListFiltersDto,
  HabitPageFiltersDto,
  HabitDto,
} from "./dto";
import { Habit } from "./habit.entity";
import { HabitStatus } from "@life-toolkit/enum";

export class HabitService {
  habitRepository: HabitRepository;

  constructor(habitRepository: HabitRepository) {
    this.habitRepository = habitRepository;
  }

  // ====== 基础 CRUD ======
  async create(createHabitDto: CreateHabitDto): Promise<HabitDto> {
    const habitEntity: Partial<Habit> = {
      name: createHabitDto.name,
      description: createHabitDto.description,
      importance: createHabitDto.importance,
      tags: createHabitDto.tags,
      difficulty: createHabitDto.difficulty,
      startDate: createHabitDto.startDate,
      targetDate: createHabitDto.targetDate,
    };
    const entity = await this.habitRepository.create(habitEntity);
    return HabitDto.importEntity(entity);
  }

  async delete(id: string): Promise<void> {
    await this.habitRepository.delete(id);
  }

  async update(id: string, updateHabitDto: UpdateHabitDto): Promise<HabitDto> {
    const habitUpdate: Partial<Habit> = {};
    if (updateHabitDto.name !== undefined) habitUpdate.name = updateHabitDto.name;
    if (updateHabitDto.description !== undefined) habitUpdate.description = updateHabitDto.description;
    if (updateHabitDto.status !== undefined) habitUpdate.status = updateHabitDto.status;
    if (updateHabitDto.importance !== undefined) habitUpdate.importance = updateHabitDto.importance;
    if (updateHabitDto.tags !== undefined) habitUpdate.tags = updateHabitDto.tags;
    if (updateHabitDto.difficulty !== undefined) habitUpdate.difficulty = updateHabitDto.difficulty;
    if (updateHabitDto.startDate !== undefined) habitUpdate.startDate = updateHabitDto.startDate;
    if (updateHabitDto.targetDate !== undefined) habitUpdate.targetDate = updateHabitDto.targetDate;
    if (updateHabitDto.currentStreak !== undefined) habitUpdate.currentStreak = updateHabitDto.currentStreak;
    if (updateHabitDto.longestStreak !== undefined) habitUpdate.longestStreak = updateHabitDto.longestStreak;
    if (updateHabitDto.completedCount !== undefined) habitUpdate.completedCount = updateHabitDto.completedCount;
    
    const entity = await this.habitRepository.update(id, habitUpdate);
    return HabitDto.importEntity(entity);
  }

  async findById(id: string): Promise<HabitDto> {
    const entity = await this.habitRepository.findById(id);
    return HabitDto.importEntity(entity);
  }

  async findAll(filter: HabitListFiltersDto): Promise<HabitDto[]> {
    const entities = await this.habitRepository.findAll(filter);
    return entities.map(entity => HabitDto.importEntity(entity));
  }

  async list(filter: HabitListFiltersDto): Promise<HabitDto[]> {
    const entities = await this.habitRepository.findAll(filter);
    return entities.map(entity => HabitDto.importEntity(entity));
  }

  async page(
    filter: HabitPageFiltersDto
  ): Promise<{ list: HabitDto[]; total: number; pageNum: number; pageSize: number }> {
    const { list, total, pageNum, pageSize } =
      await this.habitRepository.page(filter);
    return { 
      list: list.map(entity => HabitDto.importEntity(entity)), 
      total, 
      pageNum, 
      pageSize 
    };
  }

  //  ====== 业务逻辑编排 ======
  async updateStreak(id: string, increment: boolean): Promise<HabitDto> {
    const entity = await this.habitRepository.updateStreak(id, increment);
    return HabitDto.importEntity(entity);
  }

  async getHabitTodos(habitId: string): Promise<{
    activeTodos: any[];
    completedTodos: any[];
    abandonedTodos: any[];
    totalCount: number;
  }> {
    return await this.habitRepository.getHabitTodos(habitId);
  }

  async getHabitAnalytics(habitId: string): Promise<{
    totalTodos: number;
    completedTodos: number;
    abandonedTodos: number;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
    recentTodos: any[];
  }> {
    const habitEntity = await this.habitRepository.findById(habitId);
    const habit = HabitDto.importEntity(habitEntity);
    const { totalTodos, completedTodos, abandonedTodos, recentTodos } =
      await this.habitRepository.getHabitAnalyticsData(habitId);

    const completionRate =
      totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

    return {
      totalTodos,
      completedTodos,
      abandonedTodos,
      completionRate,
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      recentTodos,
    };
  }

  async abandon(id: string): Promise<void> {
    await this.update(
      id,
      Object.assign(new UpdateHabitDto(), { status: HabitStatus.ABANDONED })
    );
  }

  async restore(id: string): Promise<void> {
    await this.update(
      id,
      Object.assign(new UpdateHabitDto(), { status: HabitStatus.ACTIVE })
    );
  }

  async pauseHabit(id: string): Promise<void> {
    await this.update(
      id,
      Object.assign(new UpdateHabitDto(), { status: HabitStatus.PAUSED })
    );
  }

  async resumeHabit(id: string): Promise<void> {
    await this.update(
      id,
      Object.assign(new UpdateHabitDto(), { status: HabitStatus.ACTIVE })
    );
  }

  async completeHabit(id: string): Promise<void> {
    await this.update(
      id,
      Object.assign(new UpdateHabitDto(), {
        status: HabitStatus.COMPLETED,
        targetDate: new Date(),
      })
    );
  }
}
