import { TodoRepository } from './todo.repository';
import { TodoRepeatRepository } from './todo-repeat.repository';
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoPageFilterDto,
  TodoFilterDto,
  TodoDto,
} from './dto';
import { Todo } from './todo.entity';
import { TodoStatus, TodoSource } from '@life-toolkit/enum';
import { TodoRepeatService } from './todo-repeat.service';
import dayjs from 'dayjs';

export class TodoService {
  protected todoRepository: TodoRepository;
  protected todoRepeatRepository: TodoRepeatRepository;
  protected todoRepeatService: TodoRepeatService;

  constructor(todoRepository: TodoRepository, todoRepeatRepository: TodoRepeatRepository) {
    this.todoRepository = todoRepository;
    this.todoRepeatRepository = todoRepeatRepository;
    this.todoRepeatService = new TodoRepeatService(todoRepeatRepository);
  }

  // ====== 基础 CRUD ======

  async create(createTodoDto: CreateTodoDto): Promise<TodoDto> {
    const entity = await this.todoRepository.create(createTodoDto.exportCreateEntity());
    const todoDto = new TodoDto();
    todoDto.importEntity(entity);
    return todoDto;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.todoRepeatRepository.delete(id);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async update(updateTodoDto: UpdateTodoDto): Promise<TodoDto> {
    const entity = await this.todoRepository.update(updateTodoDto.exportUpdateEntity());
    const todoDto = new TodoDto();
    todoDto.importEntity(entity);
    return todoDto;
  }

  async find(id: string): Promise<TodoDto> {
    const entity = await this.todoRepository.find(id);
    const todoDto = new TodoDto();
    todoDto.importEntity(entity);
    return todoDto;
  }

  async findWithRelations(id: string, relations?: string[]): Promise<TodoDto> {
    const entity = await this.todoRepository.findWithRelations(id, relations || []);
    const todoDto = new TodoDto();
    todoDto.importEntity(entity);
    return todoDto;
  }

  async findByFilter(filter: TodoFilterDto): Promise<TodoDto[]> {
    const entities = await this.todoRepository.findByFilter(filter);
    return entities.map((entity) => {
      const todoDto = new TodoDto();
      todoDto.importEntity(entity);
      return todoDto;
    });
  }

  async page(filter: TodoPageFilterDto): Promise<{
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

  async listWithRepeat(filter: TodoFilterDto): Promise<TodoDto[]> {
    const todoDtoList = await this.findByFilter(filter);

    const todoRepeatDtoList = await this.todoRepeatService.generateTodoByRepeat(filter);

    return [...todoDtoList, ...todoRepeatDtoList];
  }

  async detailWithRepeat(id: string): Promise<TodoDto> {
    try {
      const entity = await this.todoRepository.find(id);
      if (entity) {
        const todoDto = new TodoDto();
        todoDto.importEntity(entity);
        return todoDto;
      }
    } catch (error) {
      console.error(error);
    }
    const repeatTodo = await this.todoRepeatService.findWithRelations(id);

    if (repeatTodo) {
      return this.todoRepeatService.generateTodo(repeatTodo);
    }
    throw new Error('未找到待办');
  }

  async deleteByTaskIds(taskIds: string[]): Promise<void> {
    if (!taskIds || taskIds.length === 0) return;
    const filter = new TodoFilterDto();
    filter.taskIds = taskIds;
    await this.todoRepository.softDeleteByFilter(filter);
  }

  async doneWithRepeatBatch(filter: TodoFilterDto): Promise<any> {
    const todoIds: string[] = [];
    const todoRepeatIds: string[] = [];

    filter.todoWithRepeatList?.forEach((todoWithRepeat) => {
      if (todoWithRepeat.source === TodoSource.IS_REPEAT) {
        todoRepeatIds.push(todoWithRepeat.id);
      } else {
        todoIds.push(todoWithRepeat.id);
      }
    });

    let result: any = [];

    // 处理普通 todo：设置为 DONE 状态，记录完成时间
    if (todoIds.length > 0) {
      const todoFilterDto = new TodoFilterDto();
      todoFilterDto.includeIds = todoIds;
      const todoUpdate = new Todo();
      todoUpdate.status = TodoStatus.DONE;
      todoUpdate.doneAt = new Date();
      const res = await this.todoRepository.updateByFilter(todoFilterDto, todoUpdate);
      result.push(res);
    }

    // 处理重复 todo：更新 currentDate 到下一个时间，并创建已完成的 todo
    if (todoRepeatIds.length > 0) {
      for (const id of todoRepeatIds) {
        const updateTodoRepeatDto = await this.todoRepeatService.updateToNext(id);
        // 创建一个新的已完成 todo
        const createTodoDto = new CreateTodoDto();
        createTodoDto.name = updateTodoRepeatDto.name;
        createTodoDto.description = updateTodoRepeatDto.description;
        createTodoDto.importance = updateTodoRepeatDto.importance;
        createTodoDto.urgency = updateTodoRepeatDto.urgency;
        createTodoDto.tags = updateTodoRepeatDto.tags || [];
        createTodoDto.planDate = dayjs(updateTodoRepeatDto.currentDate).toDate();
        createTodoDto.status = TodoStatus.DONE;
        createTodoDto.repeatId = id;
        createTodoDto.source = TodoSource.REPEAT;

        const newTodo = await this.todoRepository.create(createTodoDto.exportCreateEntity());

        // 手动设置完成相关字段和重复关联
        const updateNewTodo = new Todo();
        updateNewTodo.id = newTodo.id;
        updateNewTodo.status = TodoStatus.DONE;
        updateNewTodo.doneAt = new Date();

        const completedTodo = await this.todoRepository.update(updateNewTodo);

        const todoDto = new TodoDto();
        todoDto.importEntity(completedTodo);
        result.push(todoDto);
      }
    }

    return result;
  }

  async abandonWithRepeat(id: string): Promise<any> {
    const updateTodoDto = new UpdateTodoDto();
    updateTodoDto.id = id;
    updateTodoDto.status = TodoStatus.ABANDONED;
    updateTodoDto.abandonedAt = new Date();
    await this.update(updateTodoDto);
  }

  async restoreWithRepeat(id: string): Promise<any> {
    const updateTodoDto = new UpdateTodoDto();
    updateTodoDto.id = id;
    updateTodoDto.status = TodoStatus.TODO;
    updateTodoDto.doneAt = undefined;
    updateTodoDto.abandonedAt = undefined;
    await this.update(updateTodoDto);
  }
}
