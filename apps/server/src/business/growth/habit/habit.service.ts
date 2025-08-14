import { Injectable } from "@nestjs/common";
import {
  CreateHabitDto,
  UpdateHabitDto,
  HabitFilterDto,
  HabitPageFilterDto,
  HabitDto,
} from "@life-toolkit/business-server";
import { Todo } from "../todo/entities";
import { HabitRepository } from "./habit.repository";
import { HabitStatusService } from "./habit-status.service";
import { OperationByIdListDto } from "@/common/operation";

@Injectable()
export class HabitService {
  constructor(
    private readonly habitRepository: HabitRepository,
    private readonly habitStatusService: HabitStatusService,
  ) {}

  // 业务逻辑编排
  async create(createHabitDto: CreateHabitDto): Promise<HabitDto> {
    // 业务验证
    await this.validateBusinessRules(createHabitDto);
    
    // 数据处理
    const processedDto = await this.processCreateData(createHabitDto);
    
    // 调用数据访问层
    const result = await this.habitRepository.create(processedDto);
    
    // 后置处理（如发送通知、更新缓存等）
    await this.afterCreate(result);
    
    return result;
  }

  async findAll(filter: HabitFilterDto): Promise<HabitDto[]> {
    // 权限检查
    await this.checkPermission(filter);
    
    return await this.habitRepository.findAll(filter);
  }

  async page(filter: HabitPageFilterDto): Promise<{ list: HabitDto[]; total: number }> {
    // 权限检查
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
    // 业务验证
    await this.validateUpdateRules(id, updateHabitDto);
    
    // 数据处理
    const processedDto = await this.processUpdateData(updateHabitDto);
    
    // 调用数据访问层
    const result = await this.habitRepository.update(id, processedDto);
    
    // 后置处理
    await this.afterUpdate(result);
    
    return result;
  }

  async delete(id: string): Promise<void> {
    // 删除前检查
    await this.validateDelete(id);
    
    await this.habitRepository.delete(id);
    
    // 后置处理
    await this.afterDelete(id);
  }

  // 状态操作（委托给状态服务）
  async done(id: string): Promise<boolean> {
    return await this.habitStatusService.done(id);
  }

  async abandon(id: string): Promise<boolean> {
    return await this.habitStatusService.abandon(id);
  }

  async restore(id: string): Promise<boolean> {
    return await this.habitStatusService.restore(id);
  }

  async pause(id: string): Promise<boolean> {
    return await this.habitStatusService.pause(id);
  }

  async resume(id: string): Promise<boolean> {
    return await this.habitStatusService.resume(id);
  }

  // 批量操作
  async batchDone(params: OperationByIdListDto): Promise<void> {
    await this.habitStatusService.batchDone(params);
  }

  async findByGoalId(goalId: string): Promise<HabitDto[]> {
    return await this.habitRepository.findByGoalId(goalId);
  }

  async updateStreak(id: string, increment: boolean): Promise<HabitDto> {
    return await this.habitRepository.updateStreak(id, increment);
  }

  async getHabitTodos(habitId: string): Promise<{
    activeTodos: Todo[];
    completedTodos: Todo[];
    abandonedTodos: Todo[];
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
    recentTodos: Todo[];
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
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      recentTodos,
    };
  } 

  // 私有业务方法
  private async validateBusinessRules(dto: CreateHabitDto): Promise<void> {
    // 实现业务规则验证
    // 例如：检查习惯名称是否重复、验证日期范围等
  }

  private async processCreateData(dto: CreateHabitDto): Promise<CreateHabitDto> {
    // 实现数据预处理
    // 例如：设置默认值、格式化数据等
    return dto;
  }

  private async afterCreate(result: HabitDto): Promise<void> {
    // 实现创建后处理
    // 例如：发送通知、更新缓存、记录日志等
  }

  private async validateUpdateRules(id: string, dto: UpdateHabitDto): Promise<void> {
    // 实现更新业务规则验证
  }

  private async processUpdateData(dto: UpdateHabitDto): Promise<UpdateHabitDto> {
    // 实现更新数据预处理
    return dto;
  }

  private async afterUpdate(result: HabitDto): Promise<void> {
    // 实现更新后处理
  }

  private async validateDelete(id: string): Promise<void> {
    // 实现删除前验证
    // 例如：检查是否有关联数据、权限验证等
  }

  private async afterDelete(id: string): Promise<void> {
    // 实现删除后处理
    // 例如：清理关联数据、更新缓存等
  }

  private async checkPermission(filter: any): Promise<void> {
    // 实现权限检查
    // 例如：用户权限验证、数据访问权限等
  }
}
