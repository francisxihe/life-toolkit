import { TodoRepository, TodoRepeatService, TodoStatusService } from "./todo.repository";
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoPageFilterDto,
  TodoListFilterDto,
  TodoDto,
} from "./dto";

export class TodoService {
  protected todoRepeatService: TodoRepeatService;
  protected todoRepository: TodoRepository;
  protected todoStatusService: TodoStatusService;

  constructor(
    todoRepeatService: TodoRepeatService,
    todoRepository: TodoRepository,
    todoStatusService: TodoStatusService
  ) {
    this.todoRepeatService = todoRepeatService;
    this.todoRepository = todoRepository;
    this.todoStatusService = todoStatusService;
  }

  async create(createTodoDto: CreateTodoDto): Promise<TodoDto> {
    const todo = await this.todoRepository.create(createTodoDto);

    if ((createTodoDto as any).repeat) {
      const todoRepeat = await this.todoRepeatService.create({
        ...(createTodoDto as any).repeat,
      });
      await this.todoRepository.updateRepeatId((todo as any).id, (todoRepeat as any).id);
    }
    return await this.todoRepository.findById((todo as any).id);
  }

  async findAll(filter: TodoListFilterDto): Promise<TodoDto[]> {
    return await this.todoRepository.findAll(filter);
  }

  async page(
    filter: TodoPageFilterDto
  ): Promise<{
    list: TodoDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    return await this.todoRepository.findPage(filter);
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<TodoDto> {
    const todo = await this.todoRepository.update(id, updateTodoDto);

    if ((updateTodoDto as any).repeat) {
      await this.todoRepeatService.update((todo as any).id, (updateTodoDto as any).repeat);
    }

    return await this.todoRepository.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    return await this.todoRepository.delete(id);
  }

  async findById(id: string): Promise<TodoDto> {
    return await this.todoRepository.findById(id);
  }

  async deleteByTaskIds(taskIds: string[]): Promise<void> {
    if (!taskIds || taskIds.length === 0) return;
    await this.todoRepository.softDeleteByTaskIds(taskIds);
  }

  async batchDone(params: { idList: string[] }): Promise<void> {
    await this.todoStatusService.batchDone(params);
  }

  async done(id: string): Promise<void> {
    await this.todoStatusService.done(id);
  }

  async abandon(id: string): Promise<void> {
    await this.todoStatusService.abandon(id);
  }

  async restore(id: string): Promise<void> {
    await this.todoStatusService.restore(id);
  }
}
