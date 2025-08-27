import { TodoRepository } from "./todo.repository";
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoPageFiltersDto,
  TodoListFilterDto,
  TodoDto,
} from "./dto";
import { TodoStatus } from "@life-toolkit/enum";

export class TodoService {
  protected todoRepository: TodoRepository;

  constructor(todoRepository: TodoRepository) {
    this.todoRepository = todoRepository;
  }

  async create(createTodoDto: CreateTodoDto): Promise<TodoDto> {
    const todo = await this.todoRepository.create(createTodoDto);
    return await this.todoRepository.findById(todo.id);
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

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<TodoDto> {
    await this.todoRepository.update(id, updateTodoDto);
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
    updateTodoDto.doneAt = undefined;
    updateTodoDto.abandonedAt = undefined;
    await this.todoRepository.update(id, updateTodoDto);
  }
}
