import { AppDataSource } from '../../database.config';
import { TaskFilterDto, Task, TaskRepository as _TaskRepository } from '@life-toolkit/business-server';
import { BaseRepository } from '../../common/base';

export class TaskRepository extends BaseRepository<Task, TaskFilterDto> implements _TaskRepository {
  constructor() {
    function buildQuery(
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

    super(AppDataSource.getRepository(Task), buildQuery);
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
    const defaultRelations = ['parent', 'children', 'goal', 'todoList'];
    const entity = await this.repo.findOne({
      where: { id },
      relations: relations || defaultRelations,
    });
    if (!entity) throw new Error(`任务不存在，ID: ${id}`);
    return entity;
  }
}
