import { Repository, In, UpdateResult } from 'typeorm';
import {
  GoalPageFilterDto,
  GoalFilterDto,
  Goal,
  GoalRepository as _GoalRepository,
} from '@life-toolkit/business-server';
import { AppDataSource } from '../../database.config';
import { BaseRepository } from '../../common/base';

export class GoalRepository extends BaseRepository<Goal, GoalFilterDto> implements _GoalRepository {
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
        qb = qb.andWhere('goal.status = :status', {
          status: filter.status,
        });
      }

      if (filter.type) {
        qb = qb.andWhere('goal.type = :type', { type: filter.type });
      }

      if (filter.importance) {
        qb = qb.andWhere('goal.importance = :importance', {
          importance: filter.importance,
        });
      }

      const keyword = filter.keyword;
      if (keyword) {
        qb = qb.andWhere('(goal.name LIKE :kw OR goal.description LIKE :kw)', {
          kw: `%${keyword}%`,
        });
      }

      // 计划时间范围（desktop 字段：startDate/targetDate）
      const { startDateStart, endDateEnd } = filter;
      if (startDateStart) {
        qb = qb.andWhere('goal.startAt >= :startDateStart', {
          startDateStart: new Date(`${startDateStart}T00:00:00`),
        });
      }
      if (endDateEnd) {
        qb = qb.andWhere('goal.endAt <= :endDateEnd', {
          endDateEnd: new Date(`${endDateEnd}T23:59:59`),
        });
      }

      // 完成日期范围（desktop: completedAt）
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

      // 放弃日期范围
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
