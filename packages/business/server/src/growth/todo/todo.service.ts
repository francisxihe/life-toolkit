import { TodoRepository } from "./todo.repository";
import { TodoRepeatRepository } from "./todo-repeat.repository";
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoPageFiltersDto,
  TodoListFilterDto,
  TodoDto,
  UpdateTodoRepeatDto,
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

  async list(filter: TodoListFilterDto): Promise<TodoDto[]> {
    const list = await this.todoRepository.findAll(filter);
    return list;
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

  // ====== 业务逻辑编排 ======

  async listWithRepeat(filter: TodoListFilterDto): Promise<TodoDto[]> {
    const todoDtoList = await this.todoRepository.findAll(filter);
    const todoRepeatDtoList =
      await this.todoRepeatService.generateTodosInRange(filter);

    // 合并并去重：优先保留普通待办；
    const map = new Map<string, TodoDto>();
    todoDtoList.forEach((todoDto) => map.set(todoDto.id, todoDto));
    todoRepeatDtoList.forEach((todoRepeatDto) => {
      if (!map.has(todoRepeatDto.id)) map.set(todoRepeatDto.id, todoRepeatDto);
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.planDate).getTime() - new Date(b.planDate).getTime()
    );
  }

  async detailWithRepeat(id: string): Promise<TodoDto> {
    try {
      const todo = await this.todoRepository.findById(id);
      if (todo) return todo;
    } catch (error) {
      console.error(error);
    }
    const repeatTodo = await this.todoRepeatService.findById(id);

    if (repeatTodo) {
      return this.todoRepeatService.generateTodo(repeatTodo);
    }
    throw new Error("未找到待办");
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
    const result = await this.todoRepository.batchUpdate(
      params.idList,
      updateTodoDto
    );
    console.log(result);
    return result;
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
