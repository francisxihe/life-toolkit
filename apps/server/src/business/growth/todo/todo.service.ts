import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Todo } from "./entities";
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoPageFilterDto,
  TodoListFilterDto,
  TodoDto,
} from "./dto";
import { TodoRepeatService } from "./todo-repeat.service";
import { TodoBaseService } from "./todo-base.service";
import { TodoStatusService } from "./todo-status.service";
import { OperationByIdListDto } from "@/common/operation";

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
    private readonly todoRepeatService: TodoRepeatService,
    private readonly todoBaseService: TodoBaseService,
    private readonly todoStatusService: TodoStatusService
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<TodoDto> {
    const todo = await this.todoBaseService.create(createTodoDto);

    // 如果有重复配置，创建重复配置
    if (createTodoDto.repeat) {
      const todoRepeat = await this.todoRepeatService.create({
        ...createTodoDto.repeat,
      });

      await this.todoRepository.update(todo.id, {
        repeatId: todoRepeat.id,
      });
    }

    return await this.todoBaseService.findById(todo.id);
  }

  async findAll(filter: TodoListFilterDto): Promise<TodoDto[]> {
    return await this.todoBaseService.findAll(filter);
  }

  async page(
    filter: TodoPageFilterDto
  ): Promise<{ list: TodoDto[]; total: number }> {
    return await this.todoBaseService.page(filter);
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<TodoDto> {
    const todo = await this.todoBaseService.update(id, updateTodoDto);

    // 如果有重复配置，更新重复配置
    if (updateTodoDto.repeat) {
      await this.todoRepeatService.update(todo.id, updateTodoDto.repeat);
    }

    return await this.todoBaseService.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.todoBaseService.delete(id);
  }

  async deleteByFilter(filter: TodoPageFilterDto): Promise<void> {
    await this.todoBaseService.deleteByFilter(filter);
  }

  async findById(id: string): Promise<TodoDto> {
    return await this.todoBaseService.findById(id, ["repeat"]);
  }

  async batchDone(params: OperationByIdListDto): Promise<void> {
    await this.todoStatusService.batchDone(params);
  }

  async abandon(id: string): Promise<void> {
    const todo = await this.todoBaseService.findById(id);
    if (todo.repeatId) {
      const repeat = await this.todoRepeatService.findById(todo.repeatId);
      await this.todoRepeatService.createNextTodo(todo);
    }
    await this.todoStatusService.abandon(id);
  }

  async restore(id: string): Promise<void> {
    await this.todoStatusService.restore(id);
  }
}
