import { AppDataSource } from '../../database.config';
import { TodoFilterDto, Todo, TodoRepository as _TodoRepository } from '@life-toolkit/business-server';
import { BaseRepository } from '../../common/base';
import dayjs from 'dayjs';

export class TodoRepository extends BaseRepository<Todo, TodoFilterDto> implements _TodoRepository {
  constructor() {
    function buildQuery(filter: TodoFilterDto) {
      const qb = this.repo
        .createQueryBuilder('todo')
        .leftJoinAndSelect('todo.task', 'task')
        .leftJoinAndSelect('todo.habit', 'habit');

      // 处理 includeIds 和 excludeIds
      if (filter.includeIds && filter.includeIds.length > 0) {
        qb.andWhere('todo.id IN (:...includeIds)', { includeIds: filter.includeIds });
      }
      if (filter.excludeIds && filter.excludeIds.length > 0) {
        qb.andWhere('todo.id NOT IN (:...excludeIds)', { excludeIds: filter.excludeIds });
      }
      if (filter.status !== undefined) qb.andWhere('todo.status = :status', { status: filter.status });
      if (filter.importance !== undefined)
        qb.andWhere('todo.importance = :importance', {
          importance: filter.importance,
        });
      if (filter.urgency !== undefined) qb.andWhere('todo.urgency = :urgency', { urgency: filter.urgency });
      if (filter.taskId) qb.andWhere('todo.taskId = :taskId', { taskId: filter.taskId });
      if (filter.keyword) qb.andWhere('todo.name LIKE :kw', { kw: `%${filter.keyword}%` });
      if (filter.planDateStart) qb.andWhere('todo.planDate >= :ds', { ds: filter.planDateStart });
      if (filter.planDateEnd) qb.andWhere('todo.planDate <= :de', { de: filter.planDateEnd });
      if (filter.doneDateStart) {
        qb.andWhere('todo.doneAt >= :dds', {
          dds: dayjs(filter.doneDateStart).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        });
      }
      if (filter.doneDateEnd) {
        qb.andWhere('todo.doneAt <= :dde', {
          dde: dayjs(filter.doneDateEnd).endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        });
      }
      if (filter.abandonedDateStart)
        qb.andWhere('todo.abandonedAt >= :ads', {
          ads: dayjs(filter.abandonedDateStart).format('YYYY-MM-DD HH:mm:ss'),
        });
      if (filter.abandonedDateEnd)
        qb.andWhere('todo.abandonedAt <= :ade', {
          ade: dayjs(filter.abandonedDateEnd).format('YYYY-MM-DD HH:mm:ss'),
        });

      return qb;
    }

    super(AppDataSource.getRepository(Todo), buildQuery);
  }

  async findWithRelations(id: string, relations?: string[]): Promise<Todo> {
    const defaultRelations = ['task', 'habit'];
    const todo = await this.repo.findOne({
      where: { id },
      relations: relations || defaultRelations,
    });
    if (!todo) throw new Error(`待办不存在，ID: ${id}`);
    return todo;
  }
}
