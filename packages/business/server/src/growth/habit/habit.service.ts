import { HabitRepository } from "./habit.repository";
import {
  CreateHabitDto,
  UpdateHabitDto,
  HabitFilterDto,
  HabitPageFilterDto,
  HabitDto,
} from "./dto";

export class HabitService {
  habitRepository: HabitRepository;

  constructor(habitRepository: HabitRepository) {
    this.habitRepository = habitRepository;
  }

  // 业务逻辑编排
  async create(createHabitDto: CreateHabitDto): Promise<HabitDto> {
    const result = await this.habitRepository.create(createHabitDto);
    return result;
  }

  async findAll(filter: HabitFilterDto): Promise<HabitDto[]> {
    return await this.habitRepository.findAll(filter);
  }

  async page(
    filter: HabitPageFilterDto
  ): Promise<{ list: HabitDto[]; total: number }> {
    return await this.habitRepository.page(filter);
  }

  async findById(id: string): Promise<HabitDto> {
    return await this.habitRepository.findById(id);
  }

  async findByIdWithRelations(id: string): Promise<HabitDto> {
    return await this.habitRepository.findById(id, ["goals", "todos"]);
  }

  async update(id: string, updateHabitDto: UpdateHabitDto): Promise<HabitDto> {
    const result = await this.habitRepository.update(id, updateHabitDto);
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.habitRepository.delete(id);
  }

  async findByGoalId(goalId: string): Promise<HabitDto[]> {
    return await this.habitRepository.findByGoalId(goalId);
  }

  async updateStreak(id: string, increment: boolean): Promise<HabitDto> {
    return await this.habitRepository.updateStreak(id, increment);
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
    const habit = await this.habitRepository.findById(habitId);
    const { totalTodos, completedTodos, abandonedTodos, recentTodos } =
      await this.habitRepository.getHabitAnalyticsData(habitId);

    const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

    return {
      totalTodos,
      completedTodos,
      abandonedTodos,
      completionRate,
      currentStreak: (habit as any).currentStreak,
      longestStreak: (habit as any).longestStreak,
      recentTodos,
    };
  }
}

