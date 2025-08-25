import { In, Repository } from "typeorm";
import { AppDataSource } from "../../database.config";
import {
  HabitRepository as BusinessHabitRepository,
  CreateHabitDto,
  UpdateHabitDto,
  HabitListFiltersDto,
  HabitPageFiltersDto,
  HabitDto,
  Goal,
  Todo,
  Habit,
  HabitMapper,
} from "@life-toolkit/business-server";
import { HabitStatus, Difficulty, TodoStatus } from "@life-toolkit/enum";

export class HabitRepository implements BusinessHabitRepository {
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

    if (filter.importance !== undefined) {
      qb = qb.andWhere("habit.importance = :importance", {
        importance: filter.importance,
      });
    }

    const keyword = filter.keyword as string | undefined;
    if (keyword) {
      qb = qb.andWhere("(habit.name LIKE :kw OR habit.description LIKE :kw)", {
        kw: `%${keyword}%`,
      });
    }

    const startDateStart = filter.startDateStart as string | undefined;
    const startDateEnd = filter.startDateEnd as string | undefined;
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

    const endDataStart = filter.endDataStart as string | undefined;
    const endDataEnd = filter.endDataEnd as string | undefined;
    if (endDataStart) {
      qb = qb.andWhere("habit.targetDate >= :tds", {
        tds: new Date(`${endDataStart}T00:00:00`),
      });
    }
    if (endDataEnd) {
      qb = qb.andWhere("habit.targetDate <= :tde", {
        tde: new Date(`${endDataEnd}T23:59:59`),
      });
    }

    const goalId = filter.goalId as string | undefined;
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
    } as Partial<Habit>);

    const goalIds = createHabitDto.goalIds as string[] | undefined;
    if (goalIds && goalIds.length > 0) {
      const goals = await this.goalRepo.findBy({ id: In(goalIds) });
      entity.goals = goals;
    }

    const saved = await this.repo.save(entity);
    return HabitMapper.entityToDto(saved);
  }

  async findById(id: string, relations?: string[]): Promise<HabitDto> {
    const entity = await this.repo.findOne({ where: { id }, relations });
    if (!entity) throw new Error(`习惯不存在，ID: ${id}`);
    return HabitMapper.entityToDto(entity);
  }

  async findAll(filter: HabitListFiltersDto): Promise<HabitDto[]> {
    const qb = this.buildQuery(filter);
    const list = await qb.getMany();
    return list.map((e) => HabitMapper.entityToDto(e));
  }

  async page(
    filter: HabitPageFiltersDto
  ): Promise<{ list: HabitDto[]; total: number }> {
    const { pageNum = 1, pageSize = 10 } = filter;
    const qb = this.buildQuery(filter);
    const [entities, total] = await qb
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { list: entities.map((e) => HabitMapper.entityToDto(e)), total };
  }

  async update(id: string, updateHabitDto: UpdateHabitDto): Promise<HabitDto> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ["goals"],
    });
    if (!entity) throw new Error(`习惯不存在，ID: ${id}`);

    if (updateHabitDto.name !== undefined) entity.name = updateHabitDto.name;
    if (updateHabitDto.description !== undefined)
      entity.description = updateHabitDto.description;
    if (updateHabitDto.importance !== undefined)
      entity.importance = updateHabitDto.importance;
    if (updateHabitDto.tags !== undefined) entity.tags = updateHabitDto.tags;
    if (updateHabitDto.difficulty !== undefined)
      entity.difficulty = updateHabitDto.difficulty;
    if (updateHabitDto.startDate !== undefined)
      entity.startDate = updateHabitDto.startDate;
    if (updateHabitDto.targetDate !== undefined)
      entity.targetDate = updateHabitDto.targetDate;
    if (updateHabitDto.status !== undefined)
      entity.status = updateHabitDto.status;
    if (updateHabitDto.currentStreak !== undefined)
      entity.currentStreak = updateHabitDto.currentStreak;
    if (updateHabitDto.longestStreak !== undefined)
      entity.longestStreak = updateHabitDto.longestStreak;
    if (updateHabitDto.completedCount !== undefined)
      entity.completedCount = updateHabitDto.completedCount;

    const goalIds = updateHabitDto.goalIds as string[] | undefined;
    if (goalIds) {
      const goals =
        goalIds.length > 0
          ? await this.goalRepo.findBy({ id: In(goalIds) })
          : [];
      entity.goals = goals;
    }

    const saved = await this.repo.save(entity);
    return HabitMapper.entityToDto(saved);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`习惯不存在，ID: ${id}`);
    await this.repo.remove(entity);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async batchUpdate(ids: string[], updateData: Partial<Habit>): Promise<void> {
    await this.repo.update({ id: In(ids) }, updateData);
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

  async findByGoalId(goalId: string): Promise<HabitDto[]> {
    const list = await this.repo
      .createQueryBuilder("habit")
      .leftJoin("habit.goals", "goal")
      .where("goal.id = :goalId", { goalId })
      .andWhere("habit.deletedAt IS NULL")
      .getMany();
    return list.map((e) => HabitMapper.entityToDto(e));
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
    return HabitMapper.entityToDto(saved);
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
