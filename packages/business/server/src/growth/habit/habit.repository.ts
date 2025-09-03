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
  softDelete(id: string): Promise<void>;
  softDeleteByFilter(filter: HabitListFiltersDto): Promise<void>;
  find(id: string): Promise<Habit>;
  findWithRelations(id: string, relations?: string[]): Promise<Habit>;
}
