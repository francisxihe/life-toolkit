import { Repository } from "typeorm";
import { BaseService } from "../../base.service";
import { Todo, TodoStatus, TodoSource } from "./todo.entity";
import { AppDataSource } from "../../database.config";

export class TodoService extends BaseService<Todo> {
  constructor() {
    super(AppDataSource.getRepository(Todo));
  }

  async createTodo(todoData: {
    name: string;
    status?: TodoStatus;
    description?: string;
    importance?: number;
    urgency?: number;
    tags?: string[];
    source?: TodoSource;
    planDate?: Date;
    planStartAt?: string;
    planEndAt?: string;
    taskId?: string;
    habitId?: string;
  }): Promise<Todo> {
    return await this.create({
      ...todoData,
      status: todoData.status || TodoStatus.TODO,
      source: todoData.source || TodoSource.MANUAL,
    });
  }

  async findByStatus(status: TodoStatus): Promise<Todo[]> {
    return await this.repository.find({
      where: { status },
      relations: ['task', 'habit'],
    });
  }

  async findBySource(source: TodoSource): Promise<Todo[]> {
    return await this.repository.find({
      where: { source },
      relations: ['task', 'habit'],
    });
  }

  async findByTaskId(taskId: string): Promise<Todo[]> {
    return await this.repository.find({
      where: { taskId },
      relations: ['task', 'habit'],
    });
  }

  async findByHabitId(habitId: string): Promise<Todo[]> {
    return await this.repository.find({
      where: { habitId },
      relations: ['task', 'habit'],
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Todo[]> {
    return await this.repository
      .createQueryBuilder('todo')
      .leftJoinAndSelect('todo.task', 'task')
      .leftJoinAndSelect('todo.habit', 'habit')
      .where('todo.planDate >= :startDate', { startDate })
      .andWhere('todo.planDate <= :endDate', { endDate })
      .orderBy('todo.planDate', 'ASC')
      .getMany();
  }

  async findTodayTodos(): Promise<Todo[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return await this.findByDateRange(startOfDay, endOfDay);
  }

  async findOverdueTodos(): Promise<Todo[]> {
    const now = new Date();
    
    return await this.repository
      .createQueryBuilder('todo')
      .leftJoinAndSelect('todo.task', 'task')
      .leftJoinAndSelect('todo.habit', 'habit')
      .where('todo.planDate < :now', { now })
      .andWhere('todo.status != :doneStatus', { doneStatus: TodoStatus.DONE })
      .andWhere('todo.status != :abandonedStatus', { abandonedStatus: TodoStatus.ABANDONED })
      .orderBy('todo.planDate', 'ASC')
      .getMany();
  }

  async updateStatus(id: string, status: TodoStatus): Promise<void> {
    const updateData: Partial<Todo> = { status };
    
    if (status === TodoStatus.DONE) {
      updateData.doneAt = new Date();
    } else if (status === TodoStatus.ABANDONED) {
      updateData.abandonedAt = new Date();
    }
    
    await this.update(id, updateData);
  }

  async findByImportance(importance: number): Promise<Todo[]> {
    return await this.repository.find({
      where: { importance },
      relations: ['task', 'habit'],
      order: { planDate: 'ASC' },
    });
  }

  async findHighImportanceTodos(): Promise<Todo[]> {
    return await this.repository
      .createQueryBuilder('todo')
      .leftJoinAndSelect('todo.task', 'task')
      .leftJoinAndSelect('todo.habit', 'habit')
      .where('todo.importance >= :importance', { importance: 8 })
      .andWhere('todo.status != :doneStatus', { doneStatus: TodoStatus.DONE })
      .andWhere('todo.status != :abandonedStatus', { abandonedStatus: TodoStatus.ABANDONED })
      .orderBy('todo.importance', 'DESC')
      .addOrderBy('todo.planDate', 'ASC')
      .getMany();
  }

  async getStatistics(): Promise<{
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    abandoned: number;
  }> {
    const [total, todo, inProgress, done, abandoned] = await Promise.all([
      this.count(),
      this.repository.count({ where: { status: TodoStatus.TODO } }),
      this.repository.count({ where: { status: TodoStatus.IN_PROGRESS } }),
      this.repository.count({ where: { status: TodoStatus.DONE } }),
      this.repository.count({ where: { status: TodoStatus.ABANDONED } }),
    ]);

    return { total, todo, inProgress, done, abandoned };
  }

  async page(pageNum: number, pageSize: number): Promise<{
    data: Todo[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const [data, total] = await this.repository.findAndCount({
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
      relations: ['task', 'habit'],
    });

    return {
      data,
      total,
      pageNum,
      pageSize,
    };
  }

  async list(filter?: {
    status?: TodoStatus;
    importance?: number;
    urgency?: number;
    keyword?: string;
    planDateStart?: Date;
    planDateEnd?: Date;
    taskId?: string;
    habitId?: string;
    source?: TodoSource;
  }): Promise<Todo[]> {
    if (!filter) {
      return await this.findAll();
    }

    const queryBuilder = this.repository
      .createQueryBuilder('todo')
      .leftJoinAndSelect('todo.task', 'task')
      .leftJoinAndSelect('todo.habit', 'habit');

    if (filter.status !== undefined) {
      queryBuilder.andWhere('todo.status = :status', { status: filter.status });
    }

    if (filter.importance !== undefined) {
      queryBuilder.andWhere('todo.importance = :importance', { importance: filter.importance });
    }

    if (filter.urgency !== undefined) {
      queryBuilder.andWhere('todo.urgency = :urgency', { urgency: filter.urgency });
    }

    if (filter.keyword) {
      queryBuilder.andWhere('todo.name LIKE :keyword', { keyword: `%${filter.keyword}%` });
    }

    if (filter.planDateStart) {
      queryBuilder.andWhere('todo.planDate >= :planDateStart', { planDateStart: filter.planDateStart });
    }

    if (filter.planDateEnd) {
      queryBuilder.andWhere('todo.planDate <= :planDateEnd', { planDateEnd: filter.planDateEnd });
    }

    if (filter.taskId) {
      queryBuilder.andWhere('todo.taskId = :taskId', { taskId: filter.taskId });
    }

    if (filter.habitId) {
      queryBuilder.andWhere('todo.habitId = :habitId', { habitId: filter.habitId });
    }

    if (filter.source !== undefined) {
      queryBuilder.andWhere('todo.source = :source', { source: filter.source });
    }

    return await queryBuilder.orderBy('todo.createdAt', 'DESC').getMany();
  }

  async batchDone(ids: string[]): Promise<void> {
    await this.repository.update(ids, { 
      status: TodoStatus.DONE,
      doneAt: new Date()
    });
  }

  async abandon(id: string): Promise<void> {
    await this.updateStatus(id, TodoStatus.ABANDONED);
  }

  async restore(id: string): Promise<void> {
    await this.repository.update(id, { 
      status: TodoStatus.TODO,
      doneAt: null,
      abandonedAt: null
    });
  }

  async done(id: string): Promise<void> {
    await this.updateStatus(id, TodoStatus.DONE);
  }
}

export const todoService = new TodoService();