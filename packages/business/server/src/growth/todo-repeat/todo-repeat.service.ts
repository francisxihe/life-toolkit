import { TodoRepeatRepository } from "./todo-repeat.repository";
import {
  CreateTodoRepeatDto,
  UpdateTodoRepeatDto,
  TodoRepeatPageFiltersDto,
  TodoRepeatListFilterDto,
  TodoRepeatDto,
} from "./dto";
import { TodoStatus } from "@life-toolkit/enum";

export class TodoRepeatService {
  protected todoRepeatRepository: TodoRepeatRepository;

  constructor(todoRepeatRepository: TodoRepeatRepository) {
    this.todoRepeatRepository = todoRepeatRepository;
  }

  async create(createTodoRepeatDto: CreateTodoRepeatDto): Promise<TodoRepeatDto> {
    const todoRepeat = await this.todoRepeatRepository.create(createTodoRepeatDto);
    return await this.todoRepeatRepository.findById((todoRepeat as any).id);
  }

  async findAll(filter: TodoRepeatListFilterDto): Promise<TodoRepeatDto[]> {
    return await this.todoRepeatRepository.findAll(filter);
  }

  async list(filter: TodoRepeatListFilterDto): Promise<TodoRepeatDto[]> {
    const list = await this.todoRepeatRepository.findAll(filter);
    return list;
  }

  async page(
    filter: TodoRepeatPageFiltersDto
  ): Promise<{ list: TodoRepeatDto[]; total: number; pageNum: number; pageSize: number }> {
    const { list, total, pageNum, pageSize } =
      await this.todoRepeatRepository.page(filter);
    return { list, total, pageNum, pageSize };
  }

  async update(id: string, updateTodoRepeatDto: UpdateTodoRepeatDto): Promise<TodoRepeatDto> {
    const todoRepeat = await this.todoRepeatRepository.update(id, updateTodoRepeatDto);
    return await this.todoRepeatRepository.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    return await this.todoRepeatRepository.delete(id);
  }

  async findById(id: string): Promise<TodoRepeatDto> {
    return await this.todoRepeatRepository.findById(id);
  }

  async batchUpdate(
    idList: string[],
    updateTodoRepeatDto: UpdateTodoRepeatDto
  ): Promise<TodoRepeatDto[]> {
    return await this.todoRepeatRepository.batchUpdate(idList, updateTodoRepeatDto);
  }

  async softDelete(id: string): Promise<void> {
    await this.todoRepeatRepository.softDelete(id);
  }

  async batchSoftDelete(idList: string[]): Promise<void> {
    await this.todoRepeatRepository.batchSoftDelete(idList);
  }

  async done(id: string): Promise<any> {
    const updateTodoRepeatDto = new UpdateTodoRepeatDto();
    updateTodoRepeatDto.status = TodoStatus.DONE;
    updateTodoRepeatDto.doneAt = new Date();
    await this.todoRepeatRepository.update(id, updateTodoRepeatDto);
  }

  async abandon(id: string): Promise<any> {
    const updateTodoRepeatDto = new UpdateTodoRepeatDto();
    updateTodoRepeatDto.status = TodoStatus.ABANDONED;
    updateTodoRepeatDto.abandonedAt = new Date();
    await this.todoRepeatRepository.update(id, updateTodoRepeatDto);
  }

  async restore(id: string): Promise<any> {
    const updateTodoRepeatDto = new UpdateTodoRepeatDto();
    updateTodoRepeatDto.status = TodoStatus.TODO;
    updateTodoRepeatDto.doneAt = null as any;
    updateTodoRepeatDto.abandonedAt = null as any;
    await this.todoRepeatRepository.update(id, updateTodoRepeatDto);
  }

  batchDone(idList: string[]): Promise<any> {
    const updateTodoRepeatDto = new UpdateTodoRepeatDto();
    updateTodoRepeatDto.status = TodoStatus.DONE;
    updateTodoRepeatDto.doneAt = new Date();
    return this.todoRepeatRepository.batchUpdate(idList, updateTodoRepeatDto);
  }
}
