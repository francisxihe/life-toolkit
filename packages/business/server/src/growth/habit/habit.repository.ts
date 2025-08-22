import { HabitStatus } from "./habit.enum";
import {
  CreateHabitDto,
  UpdateHabitDto,
  HabitFilterDto,
  HabitPageFilterDto,
  HabitDto,
} from "./dto";

export interface HabitRepository {
  // 基础 CRUD
  create(createHabitDto: CreateHabitDto): Promise<HabitDto>;
  findById(id: string, relations?: string[]): Promise<HabitDto>;
  findAll(filter: HabitFilterDto): Promise<HabitDto[]>;
  page(filter: HabitPageFilterDto): Promise<{ list: HabitDto[]; total: number }>;
  update(id: string, updateHabitDto: UpdateHabitDto): Promise<HabitDto>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  batchUpdate(ids: string[], updateData: Partial<any>): Promise<void>;

  // 状态与细化方法
  updateStatus(
    id: string,
    status: HabitStatus,
    additionalData?: Record<string, any>
  ): Promise<void>;
  findByGoalId(goalId: string): Promise<HabitDto[]>;
  updateStreak(id: string, increment: boolean): Promise<HabitDto>;

  // 聚合查询
  getHabitTodos(
    habitId: string
  ): Promise<{
    activeTodos: any[];
    completedTodos: any[];
    abandonedTodos: any[];
    totalCount: number;
  }>;

  getHabitAnalyticsData(
    habitId: string
  ): Promise<{
    totalTodos: number;
    completedTodos: number;
    abandonedTodos: number;
    recentTodos: any[];
  }>;
}
