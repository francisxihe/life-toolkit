import { In, Repository, UpdateResult } from 'typeorm';
import { AppDataSource } from '../../database.config';
import {
  TaskPageFilterDto,
  TaskFilterDto,
  TaskDto,
  TaskWithTrackTimeDto,
  Task,
  TaskRepository as _TaskRepository,
} from '@life-toolkit/business-server';

export class TaskRepository implements _TaskRepository {
  private repo: Repository<Task> = AppDataSource.getRepository(Task);

  private buildQuery(
    filter: TaskFilterDto & {
      excludeIds?: string[];
    }
  ) {
    let qb = this.repo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.parent', 'parent')
      .leftJoinAndSelect('task.children', 'children')
      .andWhere('task.deletedAt IS NULL');

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

    // 完成时间范围：doneDateStart/doneDateEnd -> completedAt
    const { doneDateStart, doneDateEnd } = filter;
    if (doneDateStart && doneDateEnd) {
      qb = qb.andWhere('task.completedAt BETWEEN :ds AND :de', {
        ds: new Date(`${doneDateStart}T00:00:00`),
        de: new Date(`${doneDateEnd}T23:59:59`),
      });
    } else if (doneDateStart) {
      qb = qb.andWhere('task.completedAt >= :ds', {
        ds: new Date(`${doneDateStart}T00:00:00`),
      });
    } else if (doneDateEnd) {
      qb = qb.andWhere('task.completedAt <= :de', {
        de: new Date(`${doneDateEnd}T23:59:59`),
      });
    }

    // goalIds 过滤
    const { goalIds } = filter;
    if (goalIds && goalIds.length) qb = qb.andWhere('task.goalId IN (:...goalIds)', { goalIds });

    return qb.orderBy('task.updatedAt', 'DESC');
  }

  async create(task: Task): Promise<Task> {
    const entity = this.repo.create(task);
    const saved = await this.repo.save(entity);
    return saved;
  }

  async delete(id: string): Promise<boolean> {
    await this.repo.delete(id);
    return true;
  }

  async deleteByFilter(filter: TaskFilterDto): Promise<void> {
    const qb = this.buildQuery(filter);
    const tasks = await qb.getMany();
    if (tasks.length > 0) {
      const ids = tasks.map((task) => task.id);
      await this.repo.delete({ id: In(ids) });
    }
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async softDeleteByFilter(filter: TaskFilterDto): Promise<void> {
    const qb = this.buildQuery(filter);
    const tasks = await qb.getMany();
    if (tasks.length > 0) {
      const ids = tasks.map((task) => task.id);
      await this.repo.softDelete({ id: In(ids) });
    }
  }

  async update(taskUpdate: Task): Promise<Task> {
    if (!taskUpdate.id) throw new Error('任务ID不能为空');
    const entity = await this.repo.findOne({ where: { id: taskUpdate.id } });
    if (!entity) throw new Error(`任务不存在，ID: ${taskUpdate.id}`);
    Object.assign(entity, taskUpdate);
    const saved = await this.repo.save(entity);
    return saved;
  }

  async updateWithParent(taskUpdate: Task): Promise<Task> {
    if (!taskUpdate.id) throw new Error('任务ID不能为空');
    const entity = await this.repo.findOne({ where: { id: taskUpdate.id } });
    if (!entity) throw new Error(`任务不存在，ID: ${taskUpdate.id}`);
    Object.assign(entity, taskUpdate);
    const saved = await this.repo.save(entity);
    return saved;
  }

  async updateByFilter(filter: TaskFilterDto, taskUpdate: Task): Promise<UpdateResult> {
    const qb = this.buildQuery(filter);
    return await qb.update(taskUpdate).execute();
  }

  async find(id: string): Promise<Task> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`任务不存在，ID: ${id}`);
    return entity;
  }

  async findWithRelations(id: string, relations?: string[]): Promise<Task> {
    const defaultRelations = ['parent', 'children', 'goal', 'todoList'];
    const entity = await this.repo.findOne({
      where: { id },
      relations: relations || defaultRelations,
    });
    if (!entity) throw new Error(`任务不存在，ID: ${id}`);
    return entity;
  }

  async findAll(filter: TaskFilterDto): Promise<Task[]> {
    const qb = this.buildQuery(filter);
    return await qb.getMany();
  }

  async page(filter: TaskPageFilterDto): Promise<{
    list: Task[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const pageNum = filter.pageNum ?? 1;
    const pageSize = filter.pageSize ?? 10;
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
