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
    await this.validateBusinessRules(createHabitDto);
    const processedDto = await this.processCreateData(createHabitDto);
    const result = await this.habitRepository.create(processedDto);
    await this.afterCreate(result);
    return result;
  }

  async findAll(filter: HabitFilterDto): Promise<HabitDto[]> {
    await this.checkPermission(filter);
    return await this.habitRepository.findAll(filter);
  }

  async page(
    filter: HabitPageFilterDto
  ): Promise<{ list: HabitDto[]; total: number }> {
    await this.checkPermission(filter);
    return await this.habitRepository.page(filter);
  }

  async findById(id: string): Promise<HabitDto> {
    return await this.habitRepository.findById(id);
  }

  async findByIdWithRelations(id: string): Promise<HabitDto> {
    return await this.habitRepository.findById(id, ["goals", "todos"]);
  }

  async update(id: string, updateHabitDto: UpdateHabitDto): Promise<HabitDto> {
    await this.validateUpdateRules(id, updateHabitDto);
    const processedDto = await this.processUpdateData(updateHabitDto);
    const result = await this.habitRepository.update(id, processedDto);
    await this.afterUpdate(result);
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.validateDelete(id);
    await this.habitRepository.delete(id);
    await this.afterDelete(id);
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

  // 私有业务方法（预留扩展）
  protected async validateBusinessRules(dto: CreateHabitDto): Promise<void> {
    // hook: 例如检查名称重复、日期范围等
  }

  protected async processCreateData(dto: CreateHabitDto): Promise<CreateHabitDto> {
    return dto;
  }

  protected async afterCreate(result: HabitDto): Promise<void> {
    // hook
  }

  protected async validateUpdateRules(
    id: string,
    dto: UpdateHabitDto
  ): Promise<void> {
    // hook
  }

  protected async processUpdateData(
    dto: UpdateHabitDto
  ): Promise<UpdateHabitDto> {
    return dto;
  }

  protected async afterUpdate(result: HabitDto): Promise<void> {
    // hook
  }

  protected async validateDelete(id: string): Promise<void> {
    // hook
  }

  protected async afterDelete(id: string): Promise<void> {
    // hook
  }

  protected async checkPermission(filter: any): Promise<void> {
    // hook
  }
}

