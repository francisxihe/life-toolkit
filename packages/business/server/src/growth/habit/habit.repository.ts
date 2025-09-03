import { UpdateResult } from 'typeorm';
import { HabitStatus } from '@life-toolkit/enum';
import { Habit } from './habit.entity';
import { CreateHabitDto, UpdateHabitDto, HabitListFiltersDto, HabitPageFiltersDto, HabitDto } from './dto';

export interface HabitRepository {
  // 基础 CRUD
  create(habit: Habit): Promise<Habit>;
  findAll(filter: HabitListFiltersDto): Promise<Habit[]>;
  page(filter: HabitPageFiltersDto): Promise<{
    list: Habit[];
    total: number;
    pageNum: number;
    pageSize: number;
  }>;
  update(habitUpdate: Habit): Promise<Habit>;
  updateByFilter(filter: HabitListFiltersDto, habitUpdate: Habit): Promise<UpdateResult>;
  delete(id: string): Promise<boolean>;
  deleteByFilter(filter: HabitPageFiltersDto): Promise<void>;
  find(id: string): Promise<Habit>;
  findWithRelations(id: string, relations?: string[]): Promise<Habit>;
  softDeleteByTaskIds(taskIds: string[]): Promise<void>;

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
