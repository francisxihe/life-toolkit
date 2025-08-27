import { TodoRepository, TodoRepeatService } from "./todo.repository";
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoPageFiltersDto,
  TodoListFilterDto,
  TodoDto,
} from "./dto";
import { TodoStatus } from "@life-toolkit/enum";

export class TodoService {
  protected todoRepeatService: TodoRepeatService;
  protected todoRepository: TodoRepository;

  constructor(
    todoRepeatService: TodoRepeatService,
    todoRepository: TodoRepository
  ) {
    this.todoRepeatService = todoRepeatService;
    this.todoRepository = todoRepository;
  }

  async create(createTodoDto: CreateTodoDto): Promise<TodoDto> {
    const todo = await this.todoRepository.create(createTodoDto);

    if ((createTodoDto as any).repeat) {
      const todoRepeat = await this.todoRepeatService.create({
        ...(createTodoDto as any).repeat,
        // 模板业务字段
        name: (createTodoDto as any).name,
        description: (createTodoDto as any).description,
        tags: (createTodoDto as any).tags,
        importance: (createTodoDto as any).importance,
        urgency: (createTodoDto as any).urgency,
      });
      await this.todoRepository.updateRepeatId(
        (todo as any).id,
        (todoRepeat as any).id
      );
    }
    return await this.todoRepository.findById((todo as any).id);
  }

  async findAll(filter: TodoListFilterDto): Promise<TodoDto[]> {
    return await this.todoRepository.findAll(filter);
  }

  async list(filter: TodoListFilterDto): Promise<TodoDto[]> {
    const list = await this.todoRepository.findAll(filter);
    return list;
  }

  async page(
    filter: TodoPageFiltersDto
  ): Promise<{ list: TodoDto[]; total: number; pageNum: number; pageSize: number }> {
    const { list, total, pageNum, pageSize } =
      await this.todoRepository.page(filter);
    return { list, total, pageNum, pageSize };
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<TodoDto> {
    const todo = await this.todoRepository.update(id, updateTodoDto);

    if ((updateTodoDto as any).repeat) {
      await this.todoRepeatService.update((todo as any).id, {
        ...(updateTodoDto as any).repeat,
        // 同步模板业务字段（按需）
        name: (updateTodoDto as any).name,
        description: (updateTodoDto as any).description,
        tags: (updateTodoDto as any).tags,
        importance: (updateTodoDto as any).importance,
        urgency: (updateTodoDto as any).urgency,
      });
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

  async batchDone(params: { idList: string[] }): Promise<any> {
    if (!params?.idList?.length) return;
    const updateTodoDto = new UpdateTodoDto();
    updateTodoDto.status = TodoStatus.DONE;
    updateTodoDto.doneAt = new Date();
    await this.todoRepository.batchUpdate(params.idList, updateTodoDto);
  }

  async done(id: string): Promise<any> {
    const updateTodoDto = new UpdateTodoDto();
    updateTodoDto.status = TodoStatus.DONE;
    updateTodoDto.doneAt = new Date();
    await this.todoRepository.update(id, updateTodoDto);
  }

  async abandon(id: string): Promise<any> {
    const updateTodoDto = new UpdateTodoDto();
    updateTodoDto.status = TodoStatus.ABANDONED;
    updateTodoDto.abandonedAt = new Date();
    await this.todoRepository.update(id, updateTodoDto);
  }

  async restore(id: string): Promise<any> {
    const updateTodoDto = new UpdateTodoDto();
    updateTodoDto.status = TodoStatus.TODO;
    updateTodoDto.doneAt = null as any;
    updateTodoDto.abandonedAt = null as any;
    await this.todoRepository.update(id, updateTodoDto);
  }
}
