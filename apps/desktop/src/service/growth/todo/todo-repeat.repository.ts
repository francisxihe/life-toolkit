import { AppDataSource } from '../../db/database.config';
import { TodoRepeatFilterDto } from './dto';
import { TodoRepeat } from './todo-repeat.entity';
import { BaseRepository } from '@business/common';
import { BaseRepository as BaseRepositoryImpl } from '../../db/base.repository.impl';

export interface TodoRepeatRepository extends BaseRepository<TodoRepeat, TodoRepeatFilterDto> {
  findWithRelations(id: string, relations?: string[]): Promise<TodoRepeat>;
}

export class TodoRepeatRepository
  extends BaseRepositoryImpl<TodoRepeat, TodoRepeatFilterDto>
  implements TodoRepeatRepository
{
  constructor() {
    function buildQuery(filter: TodoRepeatFilterDto) {
      const qb = this.repo
        .createQueryBuilder('todoRepeat')
        .leftJoinAndSelect('todoRepeat.repeat', 'repeat');

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
        qb.andWhere('repeat.currentDate >= :cds', {
          cds: filter.currentDateStart,
        });
      }
      if (filter.currentDateEnd) {
        qb.andWhere('repeat.currentDate <= :cde', {
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
    const defaultRelations = ['repeat'];
    const todoRepeat = await this.repo.findOne({
      where: { id },
      relations: relations || defaultRelations,
    });
    if (!todoRepeat) throw new Error('TodoRepeat not found');
    return todoRepeat;
  }
}
