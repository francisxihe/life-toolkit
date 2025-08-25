import { Repository } from "typeorm";
import { AppDataSource } from "../../database.config";
import {
  TodoService as BusinessTodoService,
  CreateTodoDto,
  UpdateTodoDto,
  TodoListFilterDto,
  TodoPageFilterDto,
  TodoDto,
  TodoMapper,
  Todo,
} from "@life-toolkit/business-server";
import { TodoRepository } from "./todo.repository";
import TodoRepeatService from "./todo.repeat.service";
import { TodoStatus, TodoSource } from "@life-toolkit/enum";

export class TodoService {
  private service: BusinessTodoService;
  private repo: Repository<Todo>;

  constructor() {
    const repeatService = new TodoRepeatService();
    const todoRepository = new TodoRepository();
    this.service = new BusinessTodoService(
      repeatService as any,
      todoRepository as any
    );
    this.repo = AppDataSource.getRepository(Todo);
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

  async updateStatus(id: string, status: TodoStatus): Promise<void> {
    if (status === TodoStatus.DONE) return await this.service.done(id);
    if (status === TodoStatus.ABANDONED) return await this.service.abandon(id);
    if (status === TodoStatus.TODO) return await this.service.restore(id);
    // 其它状态直接更新字段
    await this.repo.update(id, { status: status as any } as any);
  }
  
  async update(
    id: string,
    data: {
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
    }
  ): Promise<TodoDto> {
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

  async page(
    pageNum: number,
    pageSize: number
  ): Promise<{
    data: TodoDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const res = await this.service.page({
      pageNum,
      pageSize,
    } as unknown as TodoPageFilterDto);
    return { data: res.list ?? [], total: res.total, pageNum, pageSize } as any;
  }

  async list(filter: TodoListFilterDto) {
    return TodoMapper.dtoToListVo(await this.service.findAll(filter));
  }

  async batchDone(idList: string[]): Promise<void> {
    await this.service.batchDone({ idList: idList });
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
