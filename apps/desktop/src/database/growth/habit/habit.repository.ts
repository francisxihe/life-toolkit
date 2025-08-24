import { In, Repository } from "typeorm";
import { AppDataSource } from "../../database.config";
import { Habit as DesktopHabit } from "./habit.entity";
import { Goal as DesktopGoal } from "../goal/goal.entity";
import {
  Todo as DesktopTodo,
  TodoStatus as DesktopTodoStatus,
} from "../todo/todo.entity";
import {
  HabitRepository as BusinessHabitRepository,
  CreateHabitDto,
  UpdateHabitDto,
  HabitListFilterDto,
  HabitPageFilterDto,
  HabitDto,
} from "@life-toolkit/business-server";
import { HabitStatus, HabitDifficulty } from "@life-toolkit/enum";

export class HabitRepository implements BusinessHabitRepository {
  private repo: Repository<DesktopHabit>;
  private goalRepo: Repository<DesktopGoal>;
  private todoRepo: Repository<DesktopTodo>;

  constructor() {
    this.repo = AppDataSource.getRepository(DesktopHabit);
    this.goalRepo = AppDataSource.getRepository(DesktopGoal);
    this.todoRepo = AppDataSource.getRepository(DesktopTodo);
  }

  private toDto(entity: DesktopHabit): HabitDto {
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      name: entity.name,
      description: entity.description,
      status: entity.status as unknown as HabitStatus,
      difficulty: entity.difficulty as unknown as HabitDifficulty,
      importance: entity.importance,
      tags: entity.tags,
      startDate: entity.startDate,
      targetDate: entity.targetDate,
      currentStreak: entity.currentStreak,
      longestStreak: entity.longestStreak,
      completedCount: entity.completedCount,
      goals: (entity.goals || []) as any,
      todos: (entity.todos || []) as any,
    } as unknown as HabitDto;
  }

  private buildQuery(filter: HabitListFilterDto) {
    let qb = this.repo
      .createQueryBuilder("habit")
      .leftJoinAndSelect("habit.goals", "goal")
      .andWhere("habit.deletedAt IS NULL");

    // 过滤条件
    if ((filter as any).id) {
      qb = qb.andWhere("habit.id = :id", { id: (filter as any).id });
    }

    if (filter.status) {
      qb = qb.andWhere("habit.status = :status", {
        status: filter.status as any,
      });
    }

    if (filter.difficulty) {
      qb = qb.andWhere("habit.difficulty = :difficulty", {
        difficulty: filter.difficulty as any,
      });
    }

    if ((filter as any).importance !== undefined) {
      qb = qb.andWhere("habit.importance = :importance", {
        importance: (filter as any).importance,
      });
    }

    const keyword = (filter as any).keyword as string | undefined;
    if (keyword) {
      qb = qb.andWhere("(habit.name LIKE :kw OR habit.description LIKE :kw)", {
        kw: `%${keyword}%`,
      });
    }

    const startDateStart = (filter as any).startDateStart as string | undefined;
    const startDateEnd = (filter as any).startDateEnd as string | undefined;
    if (startDateStart) {
      qb = qb.andWhere("habit.startDate >= :sds", {
        sds: new Date(`${startDateStart}T00:00:00`),
      });
    }
    if (startDateEnd) {
      qb = qb.andWhere("habit.startDate <= :sde", {
        sde: new Date(`${startDateEnd}T23:59:59`),
      });
    }

    const targetDateStart = (filter as any).targetDateStart as
      | string
      | undefined;
    const targetDateEnd = (filter as any).targetDateEnd as string | undefined;
    if (targetDateStart) {
      qb = qb.andWhere("habit.targetDate >= :tds", {
        tds: new Date(`${targetDateStart}T00:00:00`),
      });
    }
    if (targetDateEnd) {
      qb = qb.andWhere("habit.targetDate <= :tde", {
        tde: new Date(`${targetDateEnd}T23:59:59`),
      });
    }

    const goalId = (filter as any).goalId as string | undefined;
    if (goalId) {
      qb = qb.andWhere("goal.id = :goalId", { goalId });
    }

    return qb.orderBy("habit.updatedAt", "DESC");
  }

  async create(createHabitDto: CreateHabitDto): Promise<HabitDto> {
    const entity = this.repo.create({
      name: createHabitDto.name,
      description: createHabitDto.description,
      importance: (createHabitDto as any).importance,
      tags: (createHabitDto as any).tags,
      difficulty:
        (createHabitDto.difficulty as unknown as HabitDifficulty) ??
        HabitDifficulty.Skilled,
      startDate: (createHabitDto as any).startDate ?? new Date(),
      targetDate: (createHabitDto as any).targetDate,
      status: HabitStatus.ACTIVE as any,
    } as Partial<DesktopHabit>);

    const goalIds = (createHabitDto as any).goalIds as string[] | undefined;
    if (goalIds && goalIds.length > 0) {
      const goals = await this.goalRepo.findBy({ id: In(goalIds) });
      (entity as any).goals = goals;
    }

    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  async findById(id: string, relations?: string[]): Promise<HabitDto> {
    const entity = await this.repo.findOne({ where: { id }, relations });
    if (!entity) throw new Error(`习惯不存在，ID: ${id}`);
    return this.toDto(entity);
  }

  async findAll(filter: HabitListFilterDto): Promise<HabitDto[]> {
    const qb = this.buildQuery(filter);
    const list = await qb.getMany();
    return list.map((e) => this.toDto(e));
  }

  async page(
    filter: HabitPageFilterDto
  ): Promise<{ list: HabitDto[]; total: number }> {
    const { pageNum = 1, pageSize = 10 } = filter as any;
    const qb = this.buildQuery(filter);
    const [entities, total] = await qb
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { list: entities.map((e) => this.toDto(e)), total };
  }

  async update(id: string, updateHabitDto: UpdateHabitDto): Promise<HabitDto> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ["goals"],
    });
    if (!entity) throw new Error(`习惯不存在，ID: ${id}`);

    if ((updateHabitDto as any).name !== undefined)
      (entity as any).name = (updateHabitDto as any).name;
    if ((updateHabitDto as any).description !== undefined)
      (entity as any).description = (updateHabitDto as any).description;
    if ((updateHabitDto as any).importance !== undefined)
      (entity as any).importance = (updateHabitDto as any).importance;
    if ((updateHabitDto as any).tags !== undefined)
      (entity as any).tags = (updateHabitDto as any).tags;
    if ((updateHabitDto as any).difficulty !== undefined)
      (entity as any).difficulty = (updateHabitDto as any).difficulty as any;
    if ((updateHabitDto as any).startDate !== undefined)
      (entity as any).startDate = (updateHabitDto as any).startDate as any;
    if ((updateHabitDto as any).targetDate !== undefined)
      (entity as any).targetDate = (updateHabitDto as any).targetDate as any;
    if ((updateHabitDto as any).status !== undefined)
      (entity as any).status = (updateHabitDto as any).status as any;
    if ((updateHabitDto as any).currentStreak !== undefined)
      (entity as any).currentStreak = (updateHabitDto as any)
        .currentStreak as any;
    if ((updateHabitDto as any).longestStreak !== undefined)
      (entity as any).longestStreak = (updateHabitDto as any)
        .longestStreak as any;
    if ((updateHabitDto as any).completedCount !== undefined)
      (entity as any).completedCount = (updateHabitDto as any)
        .completedCount as any;

    const goalIds = (updateHabitDto as any).goalIds as string[] | undefined;
    if (goalIds) {
      const goals =
        goalIds.length > 0
          ? await this.goalRepo.findBy({ id: In(goalIds) })
          : [];
      (entity as any).goals = goals;
    }

    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`习惯不存在，ID: ${id}`);
    await this.repo.remove(entity);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async batchUpdate(ids: string[], updateData: Partial<any>): Promise<void> {
    await this.repo.update(
      { id: In(ids) },
      updateData as unknown as Partial<DesktopHabit>
    );
  }

  async updateStatus(
    id: string,
    status: HabitStatus,
    additionalData: Record<string, any> = {}
  ): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`习惯不存在，ID: ${id}`);
    Object.assign(entity, {
      status: status as any,
      ...(additionalData as any),
    });
    await this.repo.save(entity);
  }

  async findByGoalId(goalId: string): Promise<HabitDto[]> {
    const list = await this.repo
      .createQueryBuilder("habit")
      .leftJoin("habit.goals", "goal")
      .where("goal.id = :goalId", { goalId })
      .andWhere("habit.deletedAt IS NULL")
      .getMany();
    return list.map((e) => this.toDto(e));
  }

  async updateStreak(id: string, increment: boolean): Promise<HabitDto> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`习惯不存在，ID: ${id}`);
    if (increment) {
      (entity as any).currentStreak = ((entity as any).currentStreak || 0) + 1;
      (entity as any).completedCount =
        ((entity as any).completedCount || 0) + 1;
      if (
        (entity as any).currentStreak > ((entity as any).longestStreak || 0)
      ) {
        (entity as any).longestStreak = (entity as any).currentStreak;
      }
    } else {
      (entity as any).currentStreak = 0;
    }
    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  async getHabitTodos(habitId: string): Promise<{
    activeTodos: any[];
    completedTodos: any[];
    abandonedTodos: any[];
    totalCount: number;
  }> {
    const activeTodos = await this.todoRepo.findBy({
      habitId,
      status: In([
        DesktopTodoStatus.TODO,
        DesktopTodoStatus.IN_PROGRESS,
      ]) as any,
    });
    const completedTodos = await this.todoRepo.findBy({
      habitId,
      status: DesktopTodoStatus.DONE as any,
    });
    const abandonedTodos = await this.todoRepo.findBy({
      habitId,
      status: DesktopTodoStatus.ABANDONED as any,
    });
    const totalCount =
      activeTodos.length + completedTodos.length + abandonedTodos.length;
    return { activeTodos, completedTodos, abandonedTodos, totalCount } as any;
  }

  async getHabitAnalyticsData(habitId: string): Promise<{
    totalTodos: number;
    completedTodos: number;
    abandonedTodos: number;
    recentTodos: any[];
  }> {
    const [completedTodos, abandonedTodos, recentTodos] = await Promise.all([
      this.todoRepo.count({
        where: { habitId, status: DesktopTodoStatus.DONE as any },
      }),
      this.todoRepo.count({
        where: { habitId, status: DesktopTodoStatus.ABANDONED as any },
      }),
      this.todoRepo.find({
        where: { habitId },
        order: { updatedAt: "DESC" as any },
        take: 10,
      }),
    ]);
    const totalTodos = await this.todoRepo.count({ where: { habitId } });
    return { totalTodos, completedTodos, abandonedTodos, recentTodos } as any;
  }
}
