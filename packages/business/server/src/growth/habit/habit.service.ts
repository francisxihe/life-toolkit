import { HabitRepository } from "./habit.repository";
import {
  CreateHabitDto,
  UpdateHabitDto,
  HabitListFiltersDto,
  HabitPageFiltersDto,
  HabitDto,
} from "./dto";
import { HabitStatus } from "@life-toolkit/enum";

export class HabitService {
  habitRepository: HabitRepository;

  constructor(habitRepository: HabitRepository) {
    this.habitRepository = habitRepository;
  }

  // ====== 基础 CRUD ======
  async create(createHabitDto: CreateHabitDto): Promise<HabitDto> {
    const entity = await this.habitRepository.create(createHabitDto);
    return HabitDto.importEntity(entity);
  }

  async delete(id: string): Promise<void> {
    await this.habitRepository.delete(id);
  }

  async update(id: string, updateHabitDto: UpdateHabitDto): Promise<HabitDto> {
    const entity = await this.habitRepository.update(id, updateHabitDto);
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
