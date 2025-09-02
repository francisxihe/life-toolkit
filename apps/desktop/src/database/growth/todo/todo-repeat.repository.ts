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

  async create(createDto: CreateTodoRepeatDto): Promise<TodoRepeat> {
    const entity = createDto.exportCreateEntity();
    const saved = await this.repo.save(entity);
    return saved;
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

  async update(id: string, updateDto: UpdateTodoRepeatDto): Promise<TodoRepeat> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error('TodoRepeat not found');

    updateDto.importUpdateEntity(entity);
    updateDto.exportUpdateEntity();
    const saved = await this.repo.save(entity);
    return saved;
  }

  async batchUpdate(includeIds: string[], updateTodoRepeatDto: UpdateTodoRepeatDto): Promise<UpdateResult> {
    return this.repo.update({ id: In(includeIds) }, updateTodoRepeatDto);
  }

  async delete(id: string): Promise<boolean> {
    await this.repo.delete(id);
    return true;
  }

  async deleteByFilter(filter: TodoRepeatPageFiltersDto): Promise<void> {
    const qb = this.repo.createQueryBuilder('todoRepeat');

    // 根据过滤条件构建删除查询
    if (filter.status !== undefined) {
      qb.andWhere('todoRepeat.status = :status', { status: filter.status });
    }

    const list = await qb.getMany();
    if (list.length) await this.repo.delete(list.map((x) => x.id));
  }

  async softDelete(id: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (entity) {
      await this.repo.softRemove(entity);
    }
  }

  async batchSoftDelete(includeIds: string[]): Promise<void> {
    const entities = await this.repo.find({ where: { id: In(includeIds) } });
    if (entities.length) {
      await this.repo.softRemove(entities);
    }
  }

  async findById(id: string, relations?: string[]): Promise<TodoRepeat> {
    const todoRepeat = await this.repo.findOne({
      where: { id },
      relations: relations ?? ['todos'],
    });
    if (!todoRepeat) throw new Error('TodoRepeat not found');
    return todoRepeat;
  }

  async findOneBy(condition: any): Promise<TodoRepeat | null> {
    const todoRepeat = await this.repo.findOne({ where: condition });
    if (!todoRepeat) return null;
    return todoRepeat;
  }

  async findAllByTaskIds(taskIds: string[]): Promise<TodoRepeat[]> {
    if (!taskIds || taskIds.length === 0) return [];
    // 通过关联的todos查找TodoRepeat
    return this.repo
      .createQueryBuilder('todoRepeat')
      .innerJoin('todoRepeat.todos', 'todo')
      .where('todo.taskId IN (:...taskIds)', { taskIds })
      .getMany();
  }

  async softDeleteByTaskIds(taskIds: string[]): Promise<void> {
    if (!taskIds || taskIds.length === 0) return;
    // 通过关联的todos查找TodoRepeat
    const items = await this.repo
      .createQueryBuilder('todoRepeat')
      .innerJoin('todoRepeat.todos', 'todo')
      .where('todo.taskId IN (:...taskIds)', { taskIds })
      .getMany();
    if (items.length) await this.repo.softRemove(items);
  }
}
