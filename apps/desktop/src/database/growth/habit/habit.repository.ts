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
import { HabitStatus, Difficulty } from '@life-toolkit/enum';
import { BaseRepository } from '../../common/base';

export class HabitRepository extends BaseRepository<Habit, HabitFilterDto> implements _HabitRepository {
  repo: Repository<Habit> = AppDataSource.getRepository(Habit);
  goalRepo: Repository<Goal> = AppDataSource.getRepository(Goal);
  todoRepo: Repository<Todo> = AppDataSource.getRepository(Todo);

  constructor() {
    function buildQuery(filter: HabitFilterDto) {
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

    super(AppDataSource.getRepository(Habit), buildQuery);
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
}
