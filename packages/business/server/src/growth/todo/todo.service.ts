import { TodoRepository } from "./todo.repository";
import { TodoRepeatRepository } from "./todo-repeat.repository";
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoPageFiltersDto,
  TodoListFilterDto,
  TodoDto,
} from "./dto";
import { TodoStatus } from "@life-toolkit/enum";
import { TodoRepeatService } from "./todo-repeat.service";

export class TodoService {
  protected todoRepository: TodoRepository;
  protected todoRepeatRepository: TodoRepeatRepository;
  protected todoRepeatService: TodoRepeatService;

  constructor(
    todoRepository: TodoRepository,
    todoRepeatRepository: TodoRepeatRepository
  ) {
    this.todoRepository = todoRepository;
    this.todoRepeatRepository = todoRepeatRepository;
    this.todoRepeatService = new TodoRepeatService(todoRepeatRepository);
  }

  // ====== 基础 CRUD ======

  async create(createTodoDto: CreateTodoDto): Promise<TodoDto> {
    const todo = await this.todoRepository.create(createTodoDto);
    return await this.todoRepository.findById(todo.id);
  }

  async delete(id: string): Promise<boolean> {
    return await this.todoRepository.delete(id);
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<TodoDto> {
    await this.todoRepository.update(id, updateTodoDto);
    return await this.todoRepository.findById(id);
  }

  async findById(id: string): Promise<TodoDto> {
    return await this.todoRepository.findById(id);
  }

  async findAll(filter: TodoListFilterDto): Promise<TodoDto[]> {
    return await this.todoRepository.findAll(filter);
  }

  // ====== 业务逻辑编排 ======

  async list(filter: TodoListFilterDto): Promise<TodoDto[]> {
    const [normalList, repeatList] = await Promise.all([
      this.todoRepository.findAll(filter),
      this.todoRepeatService.generateTodosInRange(filter),
    ]);

    // 合并并去重：优先保留普通待办；重复键使用 id 或 repeatId+planDate
    const map = new Map<string, TodoDto>();
    const makeKey = (t: TodoDto) => {
      if ((t as any).id) return `id::${(t as any).id}`;
      const rid = (t as any).repeatId || (t as any).repeat?.id;
      const dateStr = new Date(t.planDate).toISOString().slice(0, 10); // YYYY-MM-DD
      return `repeat::${rid}::${dateStr}`;
    };

    for (const t of normalList) map.set(makeKey(t), t);
    for (const t of repeatList) {
      const key = makeKey(t);
      if (!map.has(key)) map.set(key, t);
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.planDate).getTime() - new Date(b.planDate).getTime()
    );
  }

  async page(filter: TodoPageFiltersDto): Promise<{
    list: TodoDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const { list, total, pageNum, pageSize } =
      await this.todoRepository.page(filter);
    return { list, total, pageNum, pageSize };
  }

  async listWithRepeat(filter: TodoListFilterDto): Promise<TodoDto[]> {
    const [normalList, repeatList] = await Promise.all([
      this.todoRepository.findAll(filter),
      this.todoRepeatService.generateTodosInRange(filter),
    ]);

    // 合并并去重：优先保留普通待办；重复键使用 id 或 repeatId+planDate
    const map = new Map<string, TodoDto>();
    const makeKey = (t: TodoDto) => {
      if ((t as any).id) return `id::${(t as any).id}`;
      const rid = (t as any).repeatId || (t as any).repeat?.id;
      const dateStr = new Date(t.planDate).toISOString().slice(0, 10); // YYYY-MM-DD
      return `repeat::${rid}::${dateStr}`;
    };

    for (const t of normalList) map.set(makeKey(t), t);
    for (const t of repeatList) {
      const key = makeKey(t);
      if (!map.has(key)) map.set(key, t);
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.planDate).getTime() - new Date(b.planDate).getTime()
    );
  }

  async detailWithRepeat(id: string): Promise<TodoDto> {
    const todo = await this.todoRepository.findById(id);

    return todo;
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
    updateTodoDto.doneAt = undefined;
    updateTodoDto.abandonedAt = undefined;
    await this.todoRepository.update(id, updateTodoDto);
  }
}
