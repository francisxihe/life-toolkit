import { UpdateResult } from "typeorm";
import { HabitStatus } from "@life-toolkit/enum";
import { Habit } from "./habit.entity";
import {
  CreateHabitDto,
  UpdateHabitDto,
  HabitListFiltersDto,
  HabitPageFiltersDto,
  HabitDto,
} from "./dto";

export interface HabitRepository {
  // 基础 CRUD
  create(createHabitDto: CreateHabitDto): Promise<Habit>;
  findById(id: string, relations?: string[]): Promise<Habit>;
  findAll(filter: HabitListFiltersDto): Promise<Habit[]>;
  page(filter: HabitPageFiltersDto): Promise<{
    list: Habit[];
    total: number;
    pageNum: number;
    pageSize: number;
  }>;
  update(id: string, updateHabitDto: UpdateHabitDto): Promise<Habit>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  batchUpdate(
    ids: string[],
    updateHabitDto: UpdateHabitDto
  ): Promise<UpdateResult>;

  // 状态与细化方法
  updateStatus(
    id: string,
    status: HabitStatus,
    additionalData?: Record<string, any>
  ): Promise<void>;
  updateStreak(id: string, increment: boolean): Promise<Habit>;

  // 聚合查询
  getHabitTodos(habitId: string): Promise<{
    activeTodos: any[];
    completedTodos: any[];
    abandonedTodos: any[];
    totalCount: number;
  }>;

  getHabitAnalyticsData(habitId: string): Promise<{
    totalTodos: number;
    completedTodos: number;
    abandonedTodos: number;
    recentTodos: any[];
  }>;
}
