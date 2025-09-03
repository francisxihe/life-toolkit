import { Repository, In, UpdateResult } from 'typeorm';
import { AppDataSource } from '../../database.config';
import {
  CreateTodoRepeatDto,
  UpdateTodoRepeatDto,
  TodoRepeatPageFiltersDto,
  TodoRepeatListFilterDto,
  TodoRepeatDto,
  TodoRepeat,
} from '@life-toolkit/business-server';

export class TodoRepeatRepository {
  repo: Repository<TodoRepeat> = AppDataSource.getRepository(TodoRepeat);

  private buildQuery(filter: TodoRepeatListFilterDto) {
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

  async create(todoRepeat: TodoRepeat): Promise<TodoRepeat> {
    const entity = this.repo.create(todoRepeat);
    const saved = await this.repo.save(entity);
    return saved;
  }

  async delete(id: string): Promise<boolean> {
    await this.repo.delete(id);
    return true;
  }

  async deleteByFilter(filter: TodoRepeatListFilterDto): Promise<void> {
    const qb = this.buildQuery(filter);
    const list = await qb.getMany();
    if (list.length) await this.repo.delete(list.map((x) => x.id));
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async softDeleteByFilter(filter: TodoRepeatListFilterDto): Promise<void> {
    const qb = this.buildQuery(filter);
    const list = await qb.getMany();
    if (list.length) {
      const ids = list.map((item) => item.id);
      await this.repo.softDelete({ id: In(ids) });
    }
  }

  async update(todoRepeatUpdate: TodoRepeat): Promise<TodoRepeat> {
    const entity = await this.repo.findOne({ where: { id: todoRepeatUpdate.id } });
    if (!entity) throw new Error('TodoRepeat not found');

    Object.assign(entity, todoRepeatUpdate);
    const saved = await this.repo.save(entity);
    return saved;
  }

  async updateByFilter(filter: any, todoRepeatUpdate: TodoRepeat): Promise<UpdateResult> {
    return this.repo.update(filter, todoRepeatUpdate);
  }

  async find(id: string): Promise<TodoRepeat> {
    const todoRepeat = await this.repo.findOne({ where: { id } });
    if (!todoRepeat) throw new Error('TodoRepeat not found');
    return todoRepeat;
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

  async findAll(filter: TodoRepeatListFilterDto): Promise<TodoRepeat[]> {
    const qb = this.buildQuery(filter);
    const list = await qb.orderBy('todoRepeat.createdAt', 'DESC').getMany();
    return list;
  }

  async page(filter: TodoRepeatPageFiltersDto): Promise<{
    list: TodoRepeat[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const { pageNum = 1, pageSize = 10 } = filter;
    const qb = this.buildQuery(filter);

    const [list, total] = await qb
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .orderBy('todoRepeat.createdAt', 'DESC')
      .getManyAndCount();

    return {
      list,
      total,
      pageNum,
      pageSize,
    };
  }

}
