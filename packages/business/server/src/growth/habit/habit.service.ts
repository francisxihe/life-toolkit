import { HabitRepository } from "./habit.repository";
import {
  CreateHabitDto,
  UpdateHabitDto,
  HabitListFiltersDto,
  HabitPageFiltersDto,
  HabitDto,
} from "./dto";
import { HabitStatus } from "@life-toolkit/enum";
import { ListResponseDto, PageResponseDto } from "../../common/response";

export class HabitService {
  habitRepository: HabitRepository;

  constructor(habitRepository: HabitRepository) {
    this.habitRepository = habitRepository;
  }

  // ====== 基础 CRUD ======
  async create(createHabitDto: CreateHabitDto): Promise<HabitDto> {
    const result = await this.habitRepository.create(createHabitDto);
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.habitRepository.delete(id);
  }

  async update(id: string, updateHabitDto: UpdateHabitDto): Promise<HabitDto> {
    const result = await this.habitRepository.update(id, updateHabitDto);
    return result;
  }

  async findById(id: string): Promise<HabitDto> {
    return await this.habitRepository.findById(id);
  }

  async findAll(filter: HabitListFiltersDto): Promise<HabitDto[]> {
    return await this.habitRepository.findAll(filter);
  }

  async list(
    filter: HabitListFiltersDto
  ): Promise<ListResponseDto<HabitDto>> {
    const list = await this.habitRepository.findAll(filter);
    return new ListResponseDto({ list, total: list.length });
  }

  async page(
    filter: HabitPageFiltersDto
  ): Promise<PageResponseDto<HabitDto>> {
    const { list, total } = await this.habitRepository.page(filter);
    return new PageResponseDto({
      list,
      total,
      pageNum: (filter as any).pageNum,
      pageSize: (filter as any).pageSize,
    });
  }

  //  ====== 业务逻辑编排 ======
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
