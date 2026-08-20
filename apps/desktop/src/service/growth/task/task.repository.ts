import { Task } from './task.entity';
import { TaskFilterDto } from './dto';
import { BaseRepository } from '@business/common';
import { AppDataSource } from '../../db/database.config';
import { BaseRepository as BaseRepositoryImpl } from '../../db/base.repository.impl';

export interface TaskRepository extends BaseRepository<Task, TaskFilterDto> {
  updateWithParent(taskUpdate: Task): Promise<Task>;
  findWithRelations(id: string, relations?: string[]): Promise<Task>;
}

export interface TaskTreeRepository {
  computeDescendantIds(target: Task | Task[]): Promise<string[]>;
}

export class TaskRepository extends BaseRepositoryImpl<Task, TaskFilterDto> implements TaskRepository {
  constructor() {
    function buildQuery(
      filter: TaskFilterDto & {
        excludeIds?: string[];
      },
      includeChildren = true,
    ) {
      let qb = this.repo
        .createQueryBuilder('task')
        .andWhere('task.deletedAt IS NULL');

      if (includeChildren) {
        qb = qb
          .leftJoinAndSelect('task.parent', 'parent')
          .leftJoinAndSelect('task.children', 'children');
      }

      const { excludeIds } = filter;
      if (excludeIds && excludeIds.length) qb = qb.andWhere('task.id NOT IN (:...excludeIds)', { excludeIds });

      const { keyword } = filter;
      if (keyword)
        qb = qb.andWhere('(task.name LIKE :kw OR task.description LIKE :kw)', {
          kw: `%${keyword}%`,
        });

      const { status } = filter;
      if (status)
        qb = qb.andWhere('task.status = :status', {
          status,
        });

      const { startDateStart, startDateEnd } = filter;
      if (startDateStart)
        qb = qb.andWhere('task.startAt >= :startDateStart', {
          startDateStart: new Date(`${startDateStart}T00:00:00`),
        });
      if (startDateEnd)
        qb = qb.andWhere('task.startAt <= :startDateEnd', {
          startDateEnd: new Date(`${startDateEnd}T23:59:59`),
        });

      const { endDateStart, endDateEnd } = filter;
      if (endDateStart)
        qb = qb.andWhere('task.endAt >= :endDateStart', {
          endDateStart: new Date(`${endDateStart}T00:00:00`),
        });
      if (endDateEnd)
        qb = qb.andWhere('task.endAt <= :endDateEnd', {
          endDateEnd: new Date(`${endDateEnd}T23:59:59`),
        });

      const { doneDateStart, doneDateEnd } = filter;
      if (doneDateStart && doneDateEnd) {
        qb = qb.andWhere('task.doneAt BETWEEN :ds AND :de', {
          ds: new Date(`${doneDateStart}T00:00:00`),
          de: new Date(`${doneDateEnd}T23:59:59`),
        });
      } else if (doneDateStart) {
        qb = qb.andWhere('task.doneAt >= :ds', {
          ds: new Date(`${doneDateStart}T00:00:00`),
        });
      } else if (doneDateEnd) {
        qb = qb.andWhere('task.doneAt <= :de', {
          de: new Date(`${doneDateEnd}T23:59:59`),
        });
      }

      const { abandonedDateStart, abandonedDateEnd } = filter;
      if (abandonedDateStart && abandonedDateEnd) {
        qb = qb.andWhere('task.abandonedAt BETWEEN :ads AND :ade', {
          ads: new Date(`${abandonedDateStart}T00:00:00`),
          ade: new Date(`${abandonedDateEnd}T23:59:59`),
        });
      } else if (abandonedDateStart) {
        qb = qb.andWhere('task.abandonedAt >= :ads', {
          ads: new Date(`${abandonedDateStart}T00:00:00`),
        });
      } else if (abandonedDateEnd) {
        qb = qb.andWhere('task.abandonedAt <= :ade', {
          ade: new Date(`${abandonedDateEnd}T23:59:59`),
        });
      }

      const { goalIds } = filter;
      if (goalIds && goalIds.length) qb = qb.andWhere('task.goalId IN (:...goalIds)', { goalIds });

      if (filter.id) qb = qb.andWhere('task.id = :id', { id: filter.id });

      return qb.orderBy('task.updatedAt', 'DESC');
    }

    super(AppDataSource.getRepository(Task), buildQuery);
  }

  async page(
    filter: TaskFilterDto & { pageNum?: number; pageSize?: number },
  ): Promise<{ list: Task[]; total: number; pageNum: number; pageSize: number }> {
    const pageNum = normalizePageValue(filter.pageNum, 1);
    const pageSize = normalizePageValue(filter.pageSize, 10, 100);
    const query = (this.buildQuery as (
      pageFilter: TaskFilterDto & { pageNum?: number; pageSize?: number },
      includeChildren?: boolean,
    ) => ReturnType<typeof this.repo.createQueryBuilder>)(filter, false);
    const [list, total] = await query
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total, pageNum, pageSize };
  }

  async updateWithParent(taskUpdate: Task): Promise<Task> {
    if (!taskUpdate.id) throw new Error('任务ID不能为空');
    const entity = await this.repo.findOne({ where: { id: taskUpdate.id } });
    if (!entity) throw new Error(`任务不存在，ID: ${taskUpdate.id}`);
    Object.assign(entity, taskUpdate);
    const saved = await this.repo.save(entity);
    return saved;
  }

  async findWithRelations(id: string, relations?: string[]): Promise<Task> {
    const defaultRelations = ['parent', 'children', 'goal'];
    const requested = relations || defaultRelations;
    const entity = await this.repo.findOne({
      where: { id },
      relations: requested.filter((r) => r !== 'todoList'),
    });
    if (!entity) throw new Error(`任务不存在，ID: ${id}`);
    return entity;
  }
}

function normalizePageValue(value: unknown, fallback: number, maximum?: number) {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue < 1) return fallback;
  return maximum ? Math.min(numberValue, maximum) : numberValue;
}
