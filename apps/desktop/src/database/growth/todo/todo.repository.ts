import { Repository, In, UpdateResult } from "typeorm";
import { AppDataSource } from "../../database.config";
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoPageFiltersDto,
  TodoListFilterDto,
  TodoDto,
  Todo,
} from "@life-toolkit/business-server";
import { TodoStatus, TodoSource } from "@life-toolkit/enum";

export class TodoRepository {
  private repo: Repository<Todo> = AppDataSource.getRepository(Todo);

  private buildQuery(filter: TodoListFilterDto) {
    const qb = this.repo
      .createQueryBuilder("todo")
      .leftJoinAndSelect("todo.task", "task")
      .leftJoinAndSelect("todo.habit", "habit");

    if (filter.status !== undefined)
      qb.andWhere("todo.status = :status", { status: filter.status });
    if (filter.importance !== undefined)
      qb.andWhere("todo.importance = :importance", {
        importance: filter.importance,
      });
    if (filter.urgency !== undefined)
      qb.andWhere("todo.urgency = :urgency", { urgency: filter.urgency });
    if (filter.taskId)
      qb.andWhere("todo.taskId = :taskId", { taskId: filter.taskId });
    if (filter.keyword)
      qb.andWhere("todo.name LIKE :kw", { kw: `%${filter.keyword}%` });
    if (filter.planDateStart)
      qb.andWhere("todo.planDate >= :ds", { ds: filter.planDateStart });
    if (filter.planDateEnd)
      qb.andWhere("todo.planDate <= :de", { de: filter.planDateEnd });
    if (filter.doneDateStart)
      qb.andWhere("todo.doneAt >= :dds", { dds: filter.doneDateStart });
    if (filter.doneDateEnd)
      qb.andWhere("todo.doneAt <= :dde", { dde: filter.doneDateEnd });
    if (filter.abandonedDateStart)
      qb.andWhere("todo.abandonedAt >= :ads", {
        ads: filter.abandonedDateStart,
      });
    if (filter.abandonedDateEnd)
      qb.andWhere("todo.abandonedAt <= :ade", { ade: filter.abandonedDateEnd });

    return qb;
  }

  async create(createDto: CreateTodoDto): Promise<Todo> {
    const entity = createDto.exportCreateEntity();
    const saved = await this.repo.save(entity);
    return saved;
  }

  async createWithExtras(
    createDto: CreateTodoDto,
    extras: Partial<Todo>
  ): Promise<Todo> {
    const entity = this.repo.create({
      name: createDto.name,
      description: createDto.description,
      status: createDto.status ?? TodoStatus.TODO,
      importance: createDto.importance,
      urgency: createDto.urgency,
      tags: createDto.tags,
      planDate: createDto.planDate,
      planStartAt: createDto.planStartAt,
      planEndAt: createDto.planEndAt,
      taskId: createDto.taskId,
      source: TodoSource.MANUAL,
      ...extras,
    });
    const saved = await this.repo.save(entity);
    return saved;
  }

  async findAll(filter: TodoListFilterDto): Promise<Todo[]> {
    const qb = this.buildQuery(filter);
    const list = await qb.orderBy("todo.createdAt", "DESC").getMany();
    return list;
  }

  async page(filter: TodoPageFiltersDto): Promise<{
    list: Todo[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const { pageNum = 1, pageSize = 10 } = filter;
    const qb = this.buildQuery(filter);

    const [list, total] = await qb
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .orderBy("todo.createdAt", "DESC")
      .getManyAndCount();
    return {
      list,
      total,
      pageNum,
      pageSize,
    };
  }

  async update(id: string, updateDto: UpdateTodoDto): Promise<Todo> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`待办不存在，ID: ${id}`);
    updateDto.importUpdateEntity(entity);
    const saved = await this.repo.save(updateDto.exportUpdateEntity());
    return saved;
  }

  async batchUpdate(
    includeIds: string[],
    updateTodoDto: UpdateTodoDto
  ): Promise<UpdateResult> {
    return this.repo.update({ id: In(includeIds) }, updateTodoDto);
  }

  async delete(id: string): Promise<boolean> {
    await this.repo.delete(id);
    return true;
  } 

  async deleteByFilter(filter: TodoPageFiltersDto): Promise<void> {
    const qb = this.repo.createQueryBuilder("todo");
    if (filter.taskIds && filter.taskIds.length > 0) {
      qb.where("todo.taskId IN (:...includeIds)", { includeIds: filter.taskIds });
    }
    const list = await qb.getMany();
    if (list.length) await this.repo.delete(list.map((x) => x.id));
  }

  async findById(id: string, relations?: string[]): Promise<Todo> {
    const todo = await this.repo.findOne({
      where: { id },
      relations: relations ?? ["task", "habit"],
    });
    if (!todo) throw new Error(`待办不存在，ID: ${id}`);
    return todo;
  }

  async updateRepeatId(id: string, repeatId: string): Promise<void> {
    await this.repo.update(id, { repeatId });
  }

  async softDeleteByTaskIds(taskIds: string[]): Promise<void> {
    if (!taskIds || taskIds.length === 0) return;
    const items = await this.repo.find({ where: { taskId: In(taskIds) } });
    if (items.length) await this.repo.softRemove(items);
  }

  async findOneByRepeatAndDate(
    repeatId: string,
    date: Date
  ): Promise<Todo | null> {
    const todo = await this.repo.findOne({
      where: { repeatId, planDate: date },
    });
    if (!todo) return null;
    return todo;
  }
}
