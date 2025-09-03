import { Repository, In, UpdateResult } from 'typeorm';
import {
  GoalPageFiltersDto,
  GoalListFiltersDto,
  Goal,
  GoalRepository as _GoalRepository,
} from '@life-toolkit/business-server';
import { GoalStatus } from '@life-toolkit/enum';
import { AppDataSource } from '../../database.config';

// 桌面端 GoalRepository 实现（适配 business 接口，结构化兼容）
export class GoalRepository implements _GoalRepository {
  repo: Repository<Goal> = AppDataSource.getRepository(Goal);

  private buildQuery(filter: GoalListFiltersDto) {
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

  async create(goal: Goal): Promise<Goal> {
    const saved = await this.repo.save(goal);
    return saved;
  }

  async delete(id: string): Promise<boolean> {
    await this.repo.delete(id);
    return true;
  }

  async deleteByFilter(filter: GoalPageFiltersDto): Promise<void> {
    const qb = this.buildQuery(filter);
    await qb.delete().execute();
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async softDeleteByFilter(filter: GoalListFiltersDto): Promise<void> {
    const qb = this.buildQuery(filter);
    const goals = await qb.getMany();
    if (goals.length > 0) {
      const ids = goals.map(goal => goal.id);
      await this.repo.softDelete({ id: In(ids) });
    }
  }

  async update(goalUpdate: Goal): Promise<Goal> {
    const entity = await this.repo.findOne({ where: { id: goalUpdate.id } });
    if (!entity) throw new Error(`目标不存在，ID: ${goalUpdate.id}`);
    Object.assign(entity, goalUpdate);
    const saved = await this.repo.save(entity);
    return saved;
  }

  async updateByFilter(filter: GoalListFiltersDto, goalUpdate: Goal): Promise<UpdateResult> {
    const qb = this.buildQuery(filter);
    return await qb.update(goalUpdate).execute();
  }

  async find(id: string): Promise<Goal> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`目标不存在，ID: ${id}`);
    return entity;
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

  async findAll(filter: GoalListFiltersDto): Promise<Goal[]> {
    const qb = this.buildQuery(filter);
    return await qb.getMany();
  }

  async page(filter: GoalPageFiltersDto): Promise<{
    list: Goal[];
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
