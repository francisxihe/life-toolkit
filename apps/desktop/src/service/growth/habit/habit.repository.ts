import { Repository } from 'typeorm';
import { AppDataSource } from '../../db/database.config';
import { HabitFilterDto } from './dto';
import { Habit } from './habit.entity';
import { Goal } from '../goal/goal.entity';
import { Todo } from '../todo/todo.entity';
import { HabitStatus, Difficulty } from '@true-north/enum';
import { BaseRepository } from '@business/common';
import { BaseRepository as BaseRepositoryImpl } from '../../db/base.repository.impl';

export interface HabitRepository extends BaseRepository<Habit, HabitFilterDto> {
  findWithRelations(id: string, relations?: string[]): Promise<Habit>;
}

export class HabitRepository extends BaseRepositoryImpl<Habit, HabitFilterDto> implements HabitRepository {
  repo: Repository<Habit> = AppDataSource.getRepository(Habit);
  goalRepo: Repository<Goal> = AppDataSource.getRepository(Goal);
  todoRepo: Repository<Todo> = AppDataSource.getRepository(Todo);

  constructor() {
    function buildQuery(filter: HabitFilterDto) {
      let qb = this.repo
        .createQueryBuilder('habit')
        .leftJoinAndSelect('habit.goals', 'goal')
        .leftJoinAndSelect('habit.repeat', 'repeat')
        .andWhere('habit.deletedAt IS NULL');

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
    const defaultRelations = ['goals', 'repeat'];
    const entity = await this.repo.findOne({
      where: { id },
      relations: relations || defaultRelations,
    });
    if (!entity) throw new Error(`习惯不存在，ID: ${id}`);
    return entity;
  }
}
