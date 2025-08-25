import {
  TodoService as BusinessTodoService,
  CreateTodoDto,
  UpdateTodoDto,
  TodoListFilterDto,
  TodoPageFilterDto,
  TodoDto,
  TodoMapper,
} from "@life-toolkit/business-server";
import { TodoRepository } from "./todo.repository";
import TodoRepeatService from "./todo.repeat.service";
import { TodoStatus } from "@life-toolkit/enum";

export class TodoService {
  private service: BusinessTodoService;

  constructor() {
    const repeatService = new TodoRepeatService();
    const todoRepository = new TodoRepository();
    this.service = new BusinessTodoService(
      repeatService as any,
      todoRepository as any
    );
  }

  async createTodo(dto: CreateTodoDto): Promise<TodoDto> {
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
    // 其它状态通过业务更新
    await this.service.update(id, { status: status as any } as UpdateTodoDto);
  }
  
  async update(id: string, dto: UpdateTodoDto): Promise<TodoDto> {
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

