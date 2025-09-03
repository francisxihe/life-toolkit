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
import { Todo } from "./todo.entity";
import { TodoStatus, TodoSource } from "@life-toolkit/enum";
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
    const todoEntity: Partial<Todo> = {
      name: createTodoDto.name,
      description: createTodoDto.description,
      status: createTodoDto.status ?? TodoStatus.TODO,
      importance: createTodoDto.importance,
      urgency: createTodoDto.urgency,
      tags: createTodoDto.tags,
      planDate: createTodoDto.planDate,
      planStartAt: createTodoDto.planStartAt,
      planEndAt: createTodoDto.planEndAt,
      taskId: createTodoDto.taskId,
      source: TodoSource.MANUAL,
    };
    const entity = await this.todoRepository.create(todoEntity as Todo);
    const todoDto = new TodoDto();
    todoDto.importEntity(entity);
    return todoDto;
  }

  async delete(id: string): Promise<boolean> {
    return await this.todoRepository.delete(id);
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<TodoDto> {
    const todoUpdate = new Todo();
    todoUpdate.id = id;
    if (updateTodoDto.name !== undefined) todoUpdate.name = updateTodoDto.name;
    if (updateTodoDto.description !== undefined) todoUpdate.description = updateTodoDto.description;
    if (updateTodoDto.status !== undefined) todoUpdate.status = updateTodoDto.status;
    if (updateTodoDto.planDate !== undefined) todoUpdate.planDate = updateTodoDto.planDate;
    if (updateTodoDto.planStartAt !== undefined) todoUpdate.planStartAt = updateTodoDto.planStartAt;
    if (updateTodoDto.planEndAt !== undefined) todoUpdate.planEndAt = updateTodoDto.planEndAt;
    if (updateTodoDto.importance !== undefined) todoUpdate.importance = updateTodoDto.importance;
    if (updateTodoDto.urgency !== undefined) todoUpdate.urgency = updateTodoDto.urgency;
    if (updateTodoDto.tags !== undefined) todoUpdate.tags = updateTodoDto.tags;
    if (updateTodoDto.doneAt !== undefined) todoUpdate.doneAt = updateTodoDto.doneAt;
    if (updateTodoDto.abandonedAt !== undefined) todoUpdate.abandonedAt = updateTodoDto.abandonedAt;
    if (updateTodoDto.taskId !== undefined) todoUpdate.taskId = updateTodoDto.taskId;
    
    const entity = await this.todoRepository.update(todoUpdate);
    const todoDto = new TodoDto();
    todoDto.importEntity(entity);
    return todoDto;
  }

  async findById(id: string, relations?: string[]): Promise<TodoDto> {
    const entity = await this.todoRepository.findById(id, relations);
    const todoDto = new TodoDto();
    todoDto.importEntity(entity);
    return todoDto;
  }

  async findAll(filter: TodoListFilterDto): Promise<TodoDto[]> {
    const entities = await this.todoRepository.findAll(filter);
    return entities.map((entity) => {
      const todoDto = new TodoDto();
      todoDto.importEntity(entity);
      return todoDto;
    });
  }

  async list(filter: TodoListFilterDto): Promise<TodoDto[]> {
    const entities = await this.todoRepository.findAll(filter);
    return entities.map((entity) => {
      const todoDto = new TodoDto();
      todoDto.importEntity(entity);
      return todoDto;
    });
  }

  async page(filter: TodoPageFiltersDto): Promise<{
    list: TodoDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const result = await this.todoRepository.page(filter);
    return {
      ...result,
      list: result.list.map((entity) => {
        const todoDto = new TodoDto();
        todoDto.importEntity(entity);
        return todoDto;
      }),
    };
  }

  // ====== 业务逻辑编排 ======

  async listWithRepeat(filter: TodoListFilterDto): Promise<TodoDto[]> {
    const todoEntities = await this.todoRepository.findAll(filter);
    const todoDtoList = todoEntities.map((entity) => {
      const todoDto = new TodoDto();
      todoDto.importEntity(entity);
      return todoDto;
    });
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
      const entity = await this.todoRepository.findById(id);
      if (entity) {
        const todoDto = new TodoDto();
        todoDto.importEntity(entity);
        return todoDto;
      }
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

  async doneBatch(params: { includeIds: string[] }): Promise<any> {
    if (!params?.includeIds?.length) return;
    const filter = new TodoListFilterDto();
    filter.importListVo({ includeIds: params.includeIds });
    const todoUpdate = new Todo();
    todoUpdate.status = TodoStatus.DONE;
    todoUpdate.doneAt = new Date();
    const result = await this.todoRepository.updateByFilter(filter, todoUpdate);
    console.log(result);
    return result;
  }

  async done(id: string): Promise<any> {
    const updateTodoDto = new UpdateTodoDto();
    updateTodoDto.status = TodoStatus.DONE;
    updateTodoDto.doneAt = new Date();
    await this.update(id, updateTodoDto);
  }

  async abandon(id: string): Promise<any> {
    const updateTodoDto = new UpdateTodoDto();
    updateTodoDto.status = TodoStatus.ABANDONED;
    updateTodoDto.abandonedAt = new Date();
    await this.update(id, updateTodoDto);
  }

  async restore(id: string): Promise<any> {
    const updateTodoDto = new UpdateTodoDto();
    updateTodoDto.status = TodoStatus.TODO;
    updateTodoDto.doneAt = undefined;
    updateTodoDto.abandonedAt = undefined;
    await this.update(id, updateTodoDto);
  }
}
