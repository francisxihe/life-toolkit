import { Repository, In, Like, DeepPartial } from "typeorm";
import { AppDataSource } from "../../database.config";
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoPageFilterDto,
  TodoListFilterDto,
  TodoDto,
  TodoMapper,
  Todo,
} from "@life-toolkit/business-server";
import { TodoStatus, TodoSource } from "@life-toolkit/enum";

export class TodoRepository /* implements import("@life-toolkit/business-server").TodoRepository */ {
  private repo: Repository<Todo> = AppDataSource.getRepository(Todo);

  async create(createDto: CreateTodoDto): Promise<TodoDto> {
    const entity = this.repo.create({
      name: createDto.name,
      description: (createDto as any).description,
      status: ((createDto as any).status as TodoStatus) ?? TodoStatus.TODO,
      importance: (createDto as any).importance,
      urgency: (createDto as any).urgency,
      tags: (createDto as any).tags,
      planDate: (createDto as any).planDate as any,
      planStartAt: (createDto as any).planStartAt,
      planEndAt: (createDto as any).planEndAt,
      taskId: (createDto as any).taskId,
      source: ((createDto as any).source as TodoSource) ?? TodoSource.MANUAL,
    } as DeepPartial<Todo>);
    const saved = await this.repo.save(entity);
    return TodoMapper.entityToDto(saved);
  }

  async createWithExtras(
    createDto: CreateTodoDto,
    extras: Partial<Todo>
  ): Promise<TodoDto> {
    const entity = this.repo.create({
      name: createDto.name,
      description: (createDto as any).description,
      status: ((createDto as any).status as TodoStatus) ?? TodoStatus.TODO,
      importance: (createDto as any).importance,
      urgency: (createDto as any).urgency,
      tags: (createDto as any).tags,
      planDate: (createDto as any).planDate as any,
      planStartAt: (createDto as any).planStartAt,
      planEndAt: (createDto as any).planEndAt,
      taskId: (createDto as any).taskId,
      source: ((createDto as any).source as TodoSource) ?? TodoSource.MANUAL,
      ...extras,
    } as DeepPartial<Todo>);
    const saved = await this.repo.save(entity);
    return TodoMapper.entityToDto(saved);
  }

  async findAll(filter: TodoListFilterDto): Promise<TodoDto[]> {
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
      qb.andWhere("todo.doneAt >= :ds", { ds: filter.doneDateStart });
    if (filter.doneDateEnd)
      qb.andWhere("todo.doneAt <= :de", { de: filter.doneDateEnd });
    if (filter.abandonedDateStart)
      qb.andWhere("todo.abandonedAt >= :ds", { ds: filter.abandonedDateStart });
    if (filter.abandonedDateEnd)
      qb.andWhere("todo.abandonedAt <= :de", { de: filter.abandonedDateEnd });

    const list = await qb.orderBy("todo.createdAt", "DESC").getMany();

    return list.map((it) => TodoMapper.entityToDto(it));
  }

  async findPage(filter: TodoPageFilterDto): Promise<{
    list: TodoDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const pageNum = (filter as any).pageNum ?? 1;
    const pageSize = (filter as any).pageSize ?? 10;
    const qb = this.repo
      .createQueryBuilder("todo")
      .leftJoinAndSelect("todo.task", "task")
      .leftJoinAndSelect("todo.habit", "habit");

    if ((filter as any).status !== undefined)
      qb.andWhere("todo.status = :status", { status: (filter as any).status });
    if ((filter as any).importance !== undefined)
      qb.andWhere("todo.importance = :importance", {
        importance: (filter as any).importance,
      });
    if ((filter as any).urgency !== undefined)
      qb.andWhere("todo.urgency = :urgency", {
        urgency: (filter as any).urgency,
      });
    if ((filter as any).taskId)
      qb.andWhere("todo.taskId = :taskId", { taskId: (filter as any).taskId });
    if ((filter as any).keyword)
      qb.andWhere("todo.name LIKE :kw", { kw: `%${(filter as any).keyword}%` });
    if ((filter as any).planDateStart)
      qb.andWhere("todo.planDate >= :ds", {
        ds: (filter as any).planDateStart,
      });
    if ((filter as any).planDateEnd)
      qb.andWhere("todo.planDate <= :de", { de: (filter as any).planDateEnd });

    const [list, total] = await qb
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .orderBy("todo.createdAt", "DESC")
      .getManyAndCount();
    return {
      list: list.map((it) => TodoMapper.entityToDto(it)),
      total,
      pageNum,
      pageSize,
    };
  }

  async update(id: string, updateDto: UpdateTodoDto): Promise<TodoDto> {
    await this.repo.update(id, updateDto);
    return await this.findById(id);
  }

  async batchUpdate(
    idList: string[],
    updateDto: UpdateTodoDto
  ): Promise<TodoDto[]> {
    await this.repo.update(idList, updateDto);
    const qb = this.repo
      .createQueryBuilder("todo")
      .leftJoinAndSelect("todo.task", "task")
      .leftJoinAndSelect("todo.habit", "habit");
    const list = await qb
      .where("todo.id IN (:...ids)", { ids: idList })
      .getMany();

    return list.map((it) => TodoMapper.entityToDto(it));
  }

  async delete(id: string): Promise<boolean> {
    await this.repo.delete(id);
    return true;
  }

  async deleteByFilter(filter: TodoPageFilterDto): Promise<void> {
    const qb = this.repo.createQueryBuilder("todo");
    if ((filter as any).taskIds && (filter as any).taskIds.length > 0) {
      qb.where("todo.taskId IN (:...ids)", { ids: (filter as any).taskIds });
    }
    const list = await qb.getMany();
    if (list.length) await this.repo.delete(list.map((x) => x.id));
  }

  async findById(id: string, relations?: string[]): Promise<TodoDto> {
    const todo = await this.repo.findOne({
      where: { id },
      relations: relations ?? ["task", "habit"],
    });
    return TodoMapper.entityToDto(todo as Todo);
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
  ): Promise<TodoDto | null> {
    const todo = await this.repo.findOne({
      where: { repeatId, planDate: date as any },
    });
    return todo ? TodoMapper.entityToDto(todo) : null;
  }
}
