import { Goal } from './goal.entity';
import { GoalFilterDto } from './dto';
import { BaseRepository } from '@business/common';
import { AppDataSource } from '../../db/database.config';
import { BaseRepository as BaseRepositoryImpl } from '../../db/base.repository.impl';

export interface GoalRepository extends BaseRepository<Goal, GoalFilterDto> {
  findWithRelations(id: string, relations?: string[]): Promise<Goal>;
}

export interface GoalTreeRepository {
  findRoots(): Promise<Goal[]>;
  findDescendants(entity: Goal): Promise<Goal[]>;
  findAncestors(entity: Goal): Promise<Goal[]>;
  findDescendantsTree(entity: Goal): Promise<Goal>;
}

export class GoalRepository extends BaseRepositoryImpl<Goal, GoalFilterDto> implements GoalRepository {
  constructor() {
    function buildQuery(filter: GoalFilterDto) {
      let qb = this.repo
        .createQueryBuilder('goal')
        .leftJoinAndSelect('goal.parent', 'parent')
        .andWhere('goal.deletedAt IS NULL');

      const includeIds = filter.includeIds;
      const excludeIds = filter.excludeIds;
      if (includeIds && includeIds.length > 0) {
        qb = qb.andWhere('goal.id IN (:...includeIds)', { includeIds });
      }
      if (excludeIds && excludeIds.length > 0) {
        qb = qb.andWhere('goal.id NOT IN (:...excludeIds)', { excludeIds });
      }

      if (filter.parentId) {
        qb = qb.andWhere('parent.id = :parentId', { parentId: filter.parentId });
      }

      if (filter.status) {
        if (Array.isArray(filter.status)) {
          qb = qb.andWhere('goal.status IN (:...statuses)', { statuses: filter.status });
        } else {
          qb = qb.andWhere('goal.status = :status', { status: filter.status });
        }
      }

      if (filter.type) {
        qb = qb.andWhere('goal.type = :type', { type: filter.type });
      }

      if (filter.importance) {
        qb = qb.andWhere('goal.importance = :importance', {
          importance: filter.importance,
        });
      }

      if (filter.difficulty) {
        qb = qb.andWhere('goal.difficulty = :difficulty', {
          difficulty: filter.difficulty,
        });
      }

      const keyword = filter.keyword;
      if (keyword) {
        qb = qb.andWhere('(goal.name LIKE :kw OR goal.description LIKE :kw)', {
          kw: `%${keyword}%`,
        });
      }

      const { startDateStart, startDateEnd, endDateStart, endDateEnd } = filter;
      if (startDateStart) {
        qb = qb.andWhere('goal.startAt >= :startDateStart', {
          startDateStart: new Date(`${startDateStart}T00:00:00`),
        });
      }
      if (startDateEnd) {
        qb = qb.andWhere('goal.startAt <= :startDateEnd', {
          startDateEnd: new Date(`${startDateEnd}T23:59:59`),
        });
      }
      if (endDateStart) {
        qb = qb.andWhere('goal.endAt >= :endDateStart', {
          endDateStart: new Date(`${endDateStart}T00:00:00`),
        });
      }
      if (endDateEnd) {
        qb = qb.andWhere('goal.endAt <= :endDateEnd', {
          endDateEnd: new Date(`${endDateEnd}T23:59:59`),
        });
      }

      const doneDateStart = filter.doneDateStart;
      const doneDateEnd = filter.doneDateEnd;
      if (doneDateStart && doneDateEnd) {
        qb = qb.andWhere('goal.doneAt BETWEEN :ds AND :de', {
          ds: new Date(`${doneDateStart}T00:00:00`),
          de: new Date(`${doneDateEnd}T23:59:59`),
        });
      } else if (doneDateStart) {
        qb = qb.andWhere('goal.doneAt >= :ds', {
          ds: new Date(`${doneDateStart}T00:00:00`),
        });
      } else if (doneDateEnd) {
        qb = qb.andWhere('goal.doneAt <= :de', {
          de: new Date(`${doneDateEnd}T23:59:59`),
        });
      }

      const abandonedDateStart = filter.abandonedDateStart;
      const abandonedDateEnd = filter.abandonedDateEnd;
      if (abandonedDateStart && abandonedDateEnd) {
        qb = qb.andWhere('goal.abandonedAt BETWEEN :ads AND :ade', {
          ads: new Date(`${abandonedDateStart}T00:00:00`),
          ade: new Date(`${abandonedDateEnd}T23:59:59`),
        });
      } else if (abandonedDateStart) {
        qb = qb.andWhere('goal.abandonedAt >= :ads', {
          ads: new Date(`${abandonedDateStart}T00:00:00`),
        });
      } else if (abandonedDateEnd) {
        qb = qb.andWhere('goal.abandonedAt <= :ade', {
          ade: new Date(`${abandonedDateEnd}T23:59:59`),
        });
      }

      return qb.orderBy('goal.updatedAt', 'DESC');
    }
    super(AppDataSource.getRepository(Goal), buildQuery);
  }

  async findWithRelations(id: string, relations?: string[]): Promise<Goal> {
    const defaultRelations = ['parent', 'children', 'taskList'];
    const entity = await this.repo.findOne({
      where: { id },
      relations: relations || defaultRelations,
    });
    if (!entity) throw new Error(`目标不存在，ID: ${id}`);
    return entity;
  }
}
