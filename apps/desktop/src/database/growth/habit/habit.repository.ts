import { In, Repository, UpdateResult } from 'typeorm';
import { AppDataSource } from '../../database.config';
import {
  HabitRepository as _HabitRepository,
  HabitFilterDto,
  HabitPageFilterDto,
  Goal,
  Todo,
  Habit,
} from '@life-toolkit/business-server';
import { HabitStatus, Difficulty, TodoStatus } from '@life-toolkit/enum';

export class HabitRepository implements _HabitRepository {
  repo: Repository<Habit> = AppDataSource.getRepository(Habit);
  goalRepo: Repository<Goal> = AppDataSource.getRepository(Goal);
  todoRepo: Repository<Todo> = AppDataSource.getRepository(Todo);

  private buildQuery(filter: HabitFilterDto) {
    let qb = this.repo
      .createQueryBuilder('habit')
      .leftJoinAndSelect('habit.goals', 'goal')
      .andWhere('habit.deletedAt IS NULL');

    // 过滤条件
    if (filter.id) {
      qb = qb.andWhere('habit.id = :id', { id: filter.id });
    }

    if (filter.status) {
      qb = qb.andWhere('habit.status = :status', {
        status: filter.status as HabitStatus,
      });
    }

    if (filter.difficulty) {
      qb = qb.andWhere('habit.difficulty = :difficulty', {
        difficulty: filter.difficulty as Difficulty,
      });
    }

    // 重要程度（单值）
    if (filter.importance !== undefined) {
      qb = qb.andWhere('habit.importance = :importance', {
        importance: filter.importance,
      });
    }

    const keyword = filter.keyword;
    if (keyword) {
      qb = qb.andWhere('(habit.name LIKE :kw OR habit.description LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    }

    const startDateStart = filter.startDateStart;
    const startDateEnd = filter.startDateEnd;
    if (startDateStart) {
      qb = qb.andWhere('habit.startDate >= :sds', {
        sds: new Date(`${startDateStart}T00:00:00`),
      });
    }
    if (startDateEnd) {
      qb = qb.andWhere('habit.startDate <= :sde', {
        sde: new Date(`${startDateEnd}T23:59:59`),
      });
    }

    const endDateStart = filter.endDateStart;
    const endDateEnd = filter.endDateEnd;
    if (endDateStart) {
      qb = qb.andWhere('habit.targetDate >= :tds', {
        tds: new Date(`${endDateStart}T00:00:00`),
      });
    }
    if (endDateEnd) {
      qb = qb.andWhere('habit.targetDate <= :tde', {
        tde: new Date(`${endDateEnd}T23:59:59`),
      });
    }

    const goalId = filter.goalId;
    if (goalId) {
      qb = qb.andWhere('goal.id = :goalId', { goalId });
    }

    return qb.orderBy('habit.updatedAt', 'DESC');
  }

  async create(habit: Habit): Promise<Habit> {
    const entity = this.repo.create(habit);
    const saved = await this.repo.save(entity);
    return saved;
  }

  async delete(id: string): Promise<boolean> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`习惯不存在，ID: ${id}`);
    await this.repo.delete(id);
    return true;
  }

  async deleteByFilter(filter: HabitPageFilterDto): Promise<void> {
    const qb = this.buildQuery(filter);
    await qb.delete().execute();
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async softDeleteByFilter(filter: HabitFilterDto): Promise<void> {
    const qb = this.buildQuery(filter);
    const habits = await qb.getMany();
    if (habits.length > 0) {
      await this.repo.softDelete(habits.map((h) => h.id));
    }
  }

  async update(habitUpdate: Habit): Promise<Habit> {
    if (!habitUpdate.id) throw new Error('习惯ID不能为空');
    const entity = await this.repo.findOne({ where: { id: habitUpdate.id } });
    if (!entity) throw new Error(`习惯不存在，ID: ${habitUpdate.id}`);
    Object.assign(entity, habitUpdate);
    const saved = await this.repo.save(entity);
    return saved;
  }

  async updateByFilter(filter: HabitFilterDto, habitUpdate: Habit): Promise<UpdateResult> {
    const qb = this.buildQuery(filter);
    return await qb.update(habitUpdate).execute();
  }

  async find(id: string): Promise<Habit> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`习惯不存在，ID: ${id}`);
    return entity;
  }

  async findWithRelations(id: string, relations?: string[]): Promise<Habit> {
    const defaultRelations = ['goals', 'todos'];
    const entity = await this.repo.findOne({
      where: { id },
      relations: relations || defaultRelations,
    });
    if (!entity) throw new Error(`习惯不存在，ID: ${id}`);
    return entity;
  }

  async findAll(filter: HabitFilterDto): Promise<Habit[]> {
    const qb = this.buildQuery(filter);
    return await qb.getMany();
  }

  async page(filter: HabitPageFilterDto): Promise<{
    list: Habit[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const { pageNum = 1, pageSize = 10 } = filter;
    const qb = this.buildQuery(filter);
    const [entities, total] = await qb
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return {
      list: entities,
      total,
      pageNum,
      pageSize,
    };
  }

}
