import { Repository } from "typeorm";
import { AppDataSource } from "../../database.config";
import { Todo as DesktopTodo, TodoStatus, TodoSource } from "./todo.entity";
import {
  TodoService as BusinessTodoService,
  CreateTodoDto,
  UpdateTodoDto,
  TodoListFilterDto,
  TodoPageFilterDto,
  TodoDto,
} from "@life-toolkit/business-server";
import { TodoRepository as DesktopTodoRepository } from "./todo.repository";
import { DesktopTodoStatusService } from "./todo.status.service";
import { DesktopTodoRepeatService } from "./todo.repeat.service";

export class TodoService {
  private service: BusinessTodoService;
  private repo: Repository<DesktopTodo>;

  constructor() {
    const repeatService = new DesktopTodoRepeatService();
    const todoRepository = new DesktopTodoRepository();
    const statusService = new DesktopTodoStatusService();
    this.service = new BusinessTodoService(repeatService as any, todoRepository as any, statusService as any);
    this.repo = AppDataSource.getRepository(DesktopTodo);
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
    repeat?: any;
  }): Promise<TodoDto> {
    const dto: CreateTodoDto = {
      name: todoData.name,
      description: todoData.description,
      status: (todoData.status as any) ?? TodoStatus.TODO,
      importance: todoData.importance,
      urgency: todoData.urgency,
      tags: todoData.tags,
      planDate: todoData.planDate as any,
      planStartAt: todoData.planStartAt,
      planEndAt: todoData.planEndAt,
      taskId: todoData.taskId,
      // source 在业务模型存在但 CreateTodoDto 未显式包含，忽略
      repeat: (todoData as any).repeat,
    } as any;
    return await this.service.create(dto);
  }

  async findAll(): Promise<TodoDto[]> {
    return await this.service.findAll({} as TodoListFilterDto);
  }

  async findById(id: string): Promise<TodoDto> {
    return await this.service.findById(id);
  }

  async findByStatus(status: TodoStatus): Promise<TodoDto[]> {
    return await this.service.findAll({ status } as any);
  }

  private async findByDateRange(startDate: Date, endDate: Date): Promise<TodoDto[]> {
    const list = await this.repo
      .createQueryBuilder("todo")
      .leftJoinAndSelect("todo.task", "task")
      .leftJoinAndSelect("todo.habit", "habit")
      .where("todo.planDate >= :startDate", { startDate })
      .andWhere("todo.planDate <= :endDate", { endDate })
      .orderBy("todo.planDate", "ASC")
      .getMany();
    return list as any;
  }

  async findTodayTodos(): Promise<TodoDto[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    return await this.findByDateRange(startOfDay, endOfDay);
  }

  async findOverdueTodos(): Promise<TodoDto[]> {
    const now = new Date();
    const list = await this.repo
      .createQueryBuilder("todo")
      .leftJoinAndSelect("todo.task", "task")
      .leftJoinAndSelect("todo.habit", "habit")
      .where("todo.planDate < :now", { now })
      .andWhere("todo.status != :doneStatus", { doneStatus: TodoStatus.DONE })
      .andWhere("todo.status != :abandonedStatus", { abandonedStatus: TodoStatus.ABANDONED })
      .orderBy("todo.planDate", "ASC")
      .getMany();
    return list as any;
  }

  async updateStatus(id: string, status: TodoStatus): Promise<void> {
    if (status === TodoStatus.DONE) return await this.service.done(id);
    if (status === TodoStatus.ABANDONED) return await this.service.abandon(id);
    if (status === TodoStatus.TODO) return await this.service.restore(id);
    // 其它状态直接更新字段
    await this.repo.update(id, { status: status as any } as any);
  }

  async findHighImportanceTodos(): Promise<TodoDto[]> {
    const list = await this.repo
      .createQueryBuilder("todo")
      .leftJoinAndSelect("todo.task", "task")
      .leftJoinAndSelect("todo.habit", "habit")
      .where("todo.importance >= :importance", { importance: 8 })
      .andWhere("todo.status != :doneStatus", { doneStatus: TodoStatus.DONE })
      .andWhere("todo.status != :abandonedStatus", { abandonedStatus: TodoStatus.ABANDONED })
      .orderBy("todo.importance", "DESC")
      .addOrderBy("todo.planDate", "ASC")
      .getMany();
    return list as any;
  }

  async getStatistics(): Promise<{
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    abandoned: number;
  }> {
    const [total, todo, inProgress, done, abandoned] = await Promise.all([
      this.repo.count(),
      this.repo.count({ where: { status: TodoStatus.TODO } as any }),
      this.repo.count({ where: { status: TodoStatus.IN_PROGRESS } as any }),
      this.repo.count({ where: { status: TodoStatus.DONE } as any }),
      this.repo.count({ where: { status: TodoStatus.ABANDONED } as any }),
    ]);
    return { total, todo, inProgress, done, abandoned };
  }

  async update(id: string, data: {
    name?: string;
    status?: TodoStatus;
    description?: string;
    importance?: number;
    urgency?: number;
    tags?: string[];
    planDate?: Date;
    planStartAt?: string;
    planEndAt?: string;
    taskId?: string;
    habitId?: string;
    repeat?: any;
  }): Promise<TodoDto> {
    const dto: UpdateTodoDto = {
      name: data.name,
      description: data.description,
      status: data.status as any,
      importance: data.importance,
      urgency: data.urgency,
      tags: data.tags,
      planDate: data.planDate as any,
      planStartAt: data.planStartAt,
      planEndAt: data.planEndAt,
      taskId: data.taskId,
      // source 非业务 Update 字段，忽略
      repeat: (data as any).repeat,
    } as any;
    return await this.service.update(id, dto);
  }

  async delete(id: string): Promise<boolean> {
    return await this.service.delete(id);
  }

  async page(pageNum: number, pageSize: number): Promise<{
    data: TodoDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const res = await this.service.page({ pageNum, pageSize } as unknown as TodoPageFilterDto);
    return { data: res.list ?? [], total: res.total, pageNum, pageSize } as any;
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
  }): Promise<TodoDto[]> {
    if (!filter) return await this.findAll();
    const f: any = {} as TodoListFilterDto;
    if (filter.status !== undefined) f.status = filter.status as any;
    if (filter.importance !== undefined) f.importance = filter.importance as any;
    if (filter.urgency !== undefined) f.urgency = filter.urgency as any;
    if (filter.keyword) f.keyword = filter.keyword;
    if (filter.planDateStart) f.planDateStart = (filter.planDateStart as any) as string;
    if (filter.planDateEnd) f.planDateEnd = (filter.planDateEnd as any) as string;
    if (filter.taskId) f.taskId = filter.taskId;
    // habitId / source 非业务筛选字段，忽略或未来扩展
    return await this.service.findAll(f);
  }

  async batchDone(ids: string[]): Promise<void> {
    await this.service.batchDone({ idList: ids });
  }

  async abandon(id: string): Promise<void> {
    await this.service.abandon(id);
  }

  async restore(id: string): Promise<void> {
    await this.service.restore(id);
  }

  async done(id: string): Promise<void> {
    await this.service.done(id);
  }
}

export const todoService = new TodoService();