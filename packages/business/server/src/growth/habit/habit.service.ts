import { HabitRepository } from "./habit.repository";
import { TodoRepository } from "../todo/todo.repository";
import {
  CreateHabitDto,
  UpdateHabitDto,
  HabitListFiltersDto,
  HabitPageFiltersDto,
  HabitDto,
} from "./dto";
import { Habit } from "./habit.entity";
import { HabitStatus, TodoStatus } from "@life-toolkit/enum";

export class HabitService {
  habitRepository: HabitRepository;
  todoRepository: TodoRepository;

  constructor(habitRepository: HabitRepository, todoRepository: TodoRepository) {
    this.habitRepository = habitRepository;
    this.todoRepository = todoRepository;
  }

  // ====== 基础 CRUD ======
  async create(createHabitDto: CreateHabitDto): Promise<HabitDto> {
    const habitEntity: Partial<Habit> = {
      name: createHabitDto.name,
      description: createHabitDto.description,
      importance: createHabitDto.importance,
      tags: createHabitDto.tags,
      difficulty: createHabitDto.difficulty,
      startDate: createHabitDto.startDate,
      targetDate: createHabitDto.targetDate,
    };
    const entity = await this.habitRepository.create(habitEntity as Habit);
    return HabitDto.importEntity(entity);
  }

  async delete(id: string): Promise<void> {
    await this.habitRepository.delete(id);
  }

  async update(id: string, updateHabitDto: UpdateHabitDto): Promise<HabitDto> {
    const habitUpdate = new Habit();
    habitUpdate.id = id;
    if (updateHabitDto.name !== undefined) habitUpdate.name = updateHabitDto.name;
    if (updateHabitDto.description !== undefined) habitUpdate.description = updateHabitDto.description;
    if (updateHabitDto.status !== undefined) habitUpdate.status = updateHabitDto.status;
    if (updateHabitDto.importance !== undefined) habitUpdate.importance = updateHabitDto.importance;
    if (updateHabitDto.tags !== undefined) habitUpdate.tags = updateHabitDto.tags;
    if (updateHabitDto.difficulty !== undefined) habitUpdate.difficulty = updateHabitDto.difficulty;
    if (updateHabitDto.startDate !== undefined) habitUpdate.startDate = updateHabitDto.startDate;
    if (updateHabitDto.targetDate !== undefined) habitUpdate.targetDate = updateHabitDto.targetDate;
    if (updateHabitDto.currentStreak !== undefined) habitUpdate.currentStreak = updateHabitDto.currentStreak;
    if (updateHabitDto.longestStreak !== undefined) habitUpdate.longestStreak = updateHabitDto.longestStreak;
    if (updateHabitDto.completedCount !== undefined) habitUpdate.completedCount = updateHabitDto.completedCount;
    
    const entity = await this.habitRepository.update(habitUpdate);
    return HabitDto.importEntity(entity);
  }

  async findById(id: string): Promise<HabitDto> {
    const entity = await this.habitRepository.find(id);
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
    const entity = await this.habitRepository.find(id);
    if (increment) {
      entity.currentStreak = (entity.currentStreak || 0) + 1;
      entity.completedCount = (entity.completedCount || 0) + 1;
      if (entity.currentStreak > (entity.longestStreak || 0)) {
        entity.longestStreak = entity.currentStreak;
      }
    } else {
      entity.currentStreak = 0;
    }
    const updatedEntity = await this.habitRepository.update(entity);
    return HabitDto.importEntity(updatedEntity);
  }

  async getHabitTodos(habitId: string): Promise<{
    activeTodos: any[];
    completedTodos: any[];
    abandonedTodos: any[];
    totalCount: number;
  }> {
    // 使用TodoRepository的findAll方法查询不同状态的todos
    const activeFilter = { habitId, status: [TodoStatus.TODO] };
    const completedFilter = { habitId, status: [TodoStatus.DONE] };
    const abandonedFilter = { habitId, status: [TodoStatus.ABANDONED] };
    
    const [activeTodos, completedTodos, abandonedTodos] = await Promise.all([
      this.todoRepository.findAll(activeFilter as any),
      this.todoRepository.findAll(completedFilter as any),
      this.todoRepository.findAll(abandonedFilter as any)
    ]);
    
    const totalCount = activeTodos.length + completedTodos.length + abandonedTodos.length;
    return { activeTodos, completedTodos, abandonedTodos, totalCount };
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
    const habitEntity = await this.habitRepository.find(habitId);
    const habit = HabitDto.importEntity(habitEntity);
    
    // 使用TodoRepository查询分析数据
    const [allTodos, completedTodos, abandonedTodos, recentTodos] = await Promise.all([
      this.todoRepository.findAll({ habitId } as any),
      this.todoRepository.findAll({ habitId, status: [TodoStatus.DONE] } as any),
      this.todoRepository.findAll({ habitId, status: [TodoStatus.ABANDONED] } as any),
      this.todoRepository.findAll({ habitId } as any) // 这里需要添加排序和限制逻辑
    ]);
    
    // 对最近的todos进行排序和限制（取最新的10条）
    const sortedRecentTodos = recentTodos
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);

    const totalTodos = allTodos.length;
    const completionRate = totalTodos > 0 ? (completedTodos.length / totalTodos) * 100 : 0;

    return {
      totalTodos,
      completedTodos: completedTodos.length,
      abandonedTodos: abandonedTodos.length,
      completionRate,
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      recentTodos: sortedRecentTodos,
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
