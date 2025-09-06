import { AppDataSource } from '../../database.config';
import { TodoRepeatListFilterDto, TodoRepeat } from '@life-toolkit/business-server';
import { TodoRepeatRepository as _TodoRepeatRepository } from '@life-toolkit/business-server';
import { BaseRepository } from '../../common/base';

export class TodoRepeatRepository
  extends BaseRepository<TodoRepeat, TodoRepeatListFilterDto>
  implements _TodoRepeatRepository
{
  constructor() {
    function buildQuery(filter: TodoRepeatListFilterDto) {
      const qb = this.repo.createQueryBuilder('todoRepeat').leftJoinAndSelect('todoRepeat.todos', 'todos');

      if (filter.status !== undefined) {
        qb.andWhere('todoRepeat.status = :status', { status: filter.status });
      }
      if (filter.importance !== undefined) {
        qb.andWhere('todoRepeat.importance = :importance', {
          importance: filter.importance,
        });
      }
      if (filter.urgency !== undefined) {
        qb.andWhere('todoRepeat.urgency = :urgency', { urgency: filter.urgency });
      }
      if (filter.keyword) {
        qb.andWhere('todoRepeat.name LIKE :kw', { kw: `%${filter.keyword}%` });
      }
      if (filter.currentDateStart) {
        qb.andWhere('todoRepeat.currentDate >= :cds', {
          cds: filter.currentDateStart,
        });
      }
      if (filter.currentDateEnd) {
        qb.andWhere('todoRepeat.currentDate <= :cde', {
          cde: filter.currentDateEnd,
        });
      }
      if (filter.abandonedDateStart) {
        qb.andWhere('todoRepeat.abandonedAt >= :ads', {
          ads: filter.abandonedDateStart,
        });
      }
      if (filter.abandonedDateEnd) {
        qb.andWhere('todoRepeat.abandonedAt <= :ade', {
          ade: filter.abandonedDateEnd,
        });
      }

      return qb;
    }

    super(AppDataSource.getRepository(TodoRepeat), buildQuery);
  }

  async findWithRelations(id: string, relations?: string[]): Promise<TodoRepeat> {
    const defaultRelations = ['todos'];
    const todoRepeat = await this.repo.findOne({
      where: { id },
      relations: relations || defaultRelations,
    });
    if (!todoRepeat) throw new Error('TodoRepeat not found');
    return todoRepeat;
  }
}
