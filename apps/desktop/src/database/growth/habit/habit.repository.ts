import { In, Repository, UpdateResult } from "typeorm";
import { AppDataSource } from "../../database.config";
import {
  HabitRepository as _HabitRepository,
  CreateHabitDto,
  UpdateHabitDto,
  HabitListFiltersDto,
  HabitPageFiltersDto,
  HabitDto,
  Goal,
  Todo,
  Habit,
} from "@life-toolkit/business-server";
import { HabitStatus, Difficulty, TodoStatus } from "@life-toolkit/enum";

export class HabitRepository implements _HabitRepository {
  private repo: Repository<Habit>;
  private goalRepo: Repository<Goal>;
  private todoRepo: Repository<Todo>;

  constructor() {
    this.repo = AppDataSource.getRepository(Habit);
    this.goalRepo = AppDataSource.getRepository(Goal);
    this.todoRepo = AppDataSource.getRepository(Todo);
  }

  private buildQuery(filter: HabitListFiltersDto) {
    let qb = this.repo
      .createQueryBuilder("habit")
      .leftJoinAndSelect("habit.goals", "goal")
      .andWhere("habit.deletedAt IS NULL");

    // 过滤条件
    if (filter.id) {
      qb = qb.andWhere("habit.id = :id", { id: filter.id });
    }

    if (filter.status) {
      qb = qb.andWhere("habit.status = :status", {
        status: filter.status as HabitStatus,
      });
    }

    if (filter.difficulty) {
      qb = qb.andWhere("habit.difficulty = :difficulty", {
        difficulty: filter.difficulty as Difficulty,
      });
    }

    // 重要程度（单值）
    if (filter.importance !== undefined) {
      qb = qb.andWhere("habit.importance = :importance", {
        importance: filter.importance,
      });
    }

    const keyword = filter.keyword;
    if (keyword) {
      qb = qb.andWhere("(habit.name LIKE :kw OR habit.description LIKE :kw)", {
        kw: `%${keyword}%`,
      });
    }

    const startDateStart = filter.startDateStart;
    const startDateEnd = filter.startDateEnd;
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

    const endDateStart = filter.endDateStart;
    const endDateEnd = filter.endDateEnd;
    if (endDateStart) {
      qb = qb.andWhere("habit.targetDate >= :tds", {
        tds: new Date(`${endDateStart}T00:00:00`),
      });
    }
    if (endDateEnd) {
      qb = qb.andWhere("habit.targetDate <= :tde", {
        tde: new Date(`${endDateEnd}T23:59:59`),
      });
    }

    const goalId = filter.goalId;
    if (goalId) {
      qb = qb.andWhere("goal.id = :goalId", { goalId });
    }

    return qb.orderBy("habit.updatedAt", "DESC");
  }

  async create(createHabitDto: CreateHabitDto): Promise<HabitDto> {
    const entity = this.repo.create({
      name: createHabitDto.name,
      description: createHabitDto.description,
      importance: createHabitDto.importance,
      tags: createHabitDto.tags,
      difficulty: createHabitDto.difficulty,
      startDate: createHabitDto.startDate ?? new Date(),
      targetDate: createHabitDto.targetDate,
      status: HabitStatus.ACTIVE,
    });

    const goalIds = createHabitDto.goalIds as string[] | undefined;
    if (goalIds && goalIds.length > 0) {
      const goals = await this.goalRepo.findBy({ id: In(goalIds) });
      entity.goals = goals;
    }

    const saved = await this.repo.save(entity);
    return HabitDto.importEntity(saved);
  }

  async findById(id: string, relations?: string[]): Promise<HabitDto> {
    const entity = await this.repo.findOne({ where: { id }, relations });
    if (!entity) throw new Error(`习惯不存在，ID: ${id}`);
    return HabitDto.importEntity(entity);
  }

  async findAll(filter: HabitListFiltersDto): Promise<HabitDto[]> {
    const qb = this.buildQuery(filter);
    const list = await qb.getMany();
    return list.map((e) => HabitDto.importEntity(e));
  }

  async page(
    habitPageFiltersDto: HabitPageFiltersDto
  ): Promise<{
    list: HabitDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const { pageNum = 1, pageSize = 10 } = habitPageFiltersDto;
    const qb = this.buildQuery(habitPageFiltersDto);
    const [entities, total] = await qb
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return {
      list: entities.map((e) => HabitDto.importEntity(e)),
      total,
      pageNum,
      pageSize,
    };
  }

  async update(id: string, updateHabitDto: UpdateHabitDto): Promise<HabitDto> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ["goals"],
    });
    if (!entity) throw new Error(`习惯不存在，ID: ${id}`);

    updateHabitDto.appendToUpdateEntity(entity);

    const goalIds = updateHabitDto.goalIds as string[] | undefined;
    if (goalIds) {
      const goals =
        goalIds.length > 0
          ? await this.goalRepo.findBy({ id: In(goalIds) })
          : [];
      entity.goals = goals;
    }

    const saved = await this.repo.save(entity);

    return HabitDto.importEntity(saved);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`习惯不存在，ID: ${id}`);
    await this.repo.remove(entity);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async batchUpdate(
    idList: string[],
    updateHabitDto: UpdateHabitDto
  ): Promise<UpdateResult> {
    return this.repo.update({ id: In(idList) }, updateHabitDto);
  }

  async updateStatus(
    id: string,
    status: HabitStatus,
    additionalData: Record<string, any> = {}
  ): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`习惯不存在，ID: ${id}`);
    Object.assign(entity, {
      status: status,
      ...additionalData,
    });
    await this.repo.save(entity);
  }

  async updateStreak(id: string, increment: boolean): Promise<HabitDto> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`习惯不存在，ID: ${id}`);
    if (increment) {
      entity.currentStreak = (entity.currentStreak || 0) + 1;
      entity.completedCount = (entity.completedCount || 0) + 1;
      if (entity.currentStreak > (entity.longestStreak || 0)) {
        entity.longestStreak = entity.currentStreak;
      }
    } else {
      entity.currentStreak = 0;
    }
    const saved = await this.repo.save(entity);
    return HabitDto.importEntity(saved);
  }

  async getHabitTodos(habitId: string): Promise<{
    activeTodos: Todo[];
    completedTodos: Todo[];
    abandonedTodos: Todo[];
    totalCount: number;
  }> {
    const activeTodos = await this.todoRepo.findBy({
      habitId,
      status: In([TodoStatus.TODO]),
    });
    const completedTodos = await this.todoRepo.findBy({
      habitId,
      status: TodoStatus.DONE,
    });
    const abandonedTodos = await this.todoRepo.findBy({
      habitId,
      status: TodoStatus.ABANDONED,
    });
    const totalCount =
      activeTodos.length + completedTodos.length + abandonedTodos.length;
    return { activeTodos, completedTodos, abandonedTodos, totalCount };
  }

  async getHabitAnalyticsData(habitId: string): Promise<{
    totalTodos: number;
    completedTodos: number;
    abandonedTodos: number;
    recentTodos: Todo[];
  }> {
    const [completedTodos, abandonedTodos, recentTodos] = await Promise.all([
      this.todoRepo.count({
        where: { habitId, status: TodoStatus.DONE },
      }),
      this.todoRepo.count({
        where: { habitId, status: TodoStatus.ABANDONED },
      }),
      this.todoRepo.find({
        where: { habitId },
        order: { updatedAt: "DESC" },
        take: 10,
      }),
    ]);
    const totalTodos = await this.todoRepo.count({ where: { habitId } });
    return { totalTodos, completedTodos, abandonedTodos, recentTodos };
  }
}
