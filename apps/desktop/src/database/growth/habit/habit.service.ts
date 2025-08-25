import { HabitRepository } from "./habit.repository";
import {
  HabitService as _HabitService,
  CreateHabitDto,
  UpdateHabitDto,
  HabitListFiltersDto,
  HabitPageFiltersDto,
  HabitDto,
} from "@life-toolkit/business-server";

export class HabitService {
  private service: _HabitService;

  constructor() {
    const repo = new HabitRepository();
    this.service = new _HabitService(repo);
  }

  async create(createHabitDto: CreateHabitDto): Promise<HabitDto> {
    return await this.service.create(createHabitDto);
  }

  async findById(id: string): Promise<HabitDto> {
    return await this.service.findById(id);
  }

  async findAll(): Promise<HabitDto[]> {
    return await this.service.findAll({} as HabitListFiltersDto);
  }

  async findByGoalId(goalId: string): Promise<HabitDto[]> {
    return await this.service.findByGoalId(goalId);
  }

  async update(id: string, updateHabitDto: UpdateHabitDto): Promise<HabitDto> {
    return await this.service.update(id, updateHabitDto);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }

  async updateStreak(id: string, completed: boolean): Promise<void> {
    await this.service.updateStreak(id, completed);
  }

  async getHabitTodos(id: string) {
    return await this.service.getHabitTodos(id);
  }

  async getHabitAnalytics(id: string) {
    return await this.service.getHabitAnalytics(id);
  }

  async page(filter: HabitPageFiltersDto): Promise<{
    data: HabitDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const res = await this.service.page(filter);
    return {
      data: res.list ?? [],
      total: res.total,
      pageNum: (filter as any).pageNum,
      pageSize: (filter as any).pageSize,
    } as any;
  }

  async list(filter?: HabitListFiltersDto): Promise<HabitDto[]> {
    return await this.service.findAll(filter);
  }

  async pauseHabit(id: string): Promise<void> {
    await this.service.pauseHabit(id);
  }

  async resumeHabit(id: string): Promise<void> {
    await this.service.resumeHabit(id);
  }

  async completeHabit(id: string): Promise<void> {
    await this.service.completeHabit(id);
  }
}

export const habitService = new HabitService();

