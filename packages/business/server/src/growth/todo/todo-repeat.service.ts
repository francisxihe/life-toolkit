import { TodoRepeatRepository } from "./todo-repeat.repository";
import {
  CreateTodoRepeatDto,
  UpdateTodoRepeatDto,
  TodoRepeatPageFiltersDto,
  TodoRepeatListFilterDto,
  TodoRepeatDto,
} from "./dto";
import { TodoRepository } from "./todo.repository";
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoPageFilterDto,
  TodoFilterDto,
  TodoDto,
} from "./dto";
import { Todo } from "./todo.entity";
import { TodoRepeat } from "./todo-repeat.entity";
import { RepeatEndMode, Repeat as RepeatConfig } from "@life-toolkit/components-repeat/types";
import { calculateNextDate } from "@life-toolkit/components-repeat/common";
import { TodoStatus, TodoSource } from "@life-toolkit/enum";
import dayjs from "dayjs";

export class TodoRepeatService {
  todoRepeatRepository: TodoRepeatRepository;

  constructor(todoRepeatRepository: TodoRepeatRepository) {
    this.todoRepeatRepository = todoRepeatRepository;
  }

  // ====== 基础 CRUD ======

  async create(
    createTodoRepeatDto: CreateTodoRepeatDto
  ): Promise<TodoRepeatDto> {
    const todoRepeatEntity: Partial<TodoRepeat> = {
      name: createTodoRepeatDto.name,
      description: createTodoRepeatDto.description,
      importance: createTodoRepeatDto.importance,
      urgency: createTodoRepeatDto.urgency,
      tags: createTodoRepeatDto.tags,
      status: createTodoRepeatDto.status,
      repeatStartDate: createTodoRepeatDto.repeatStartDate,
      currentDate: createTodoRepeatDto.currentDate,
      repeatMode: createTodoRepeatDto.repeatMode,
      repeatConfig: createTodoRepeatDto.repeatConfig,
      repeatEndMode: createTodoRepeatDto.repeatEndMode,
      repeatEndDate: createTodoRepeatDto.repeatEndDate,
      repeatTimes: createTodoRepeatDto.repeatTimes,
      repeatedTimes: createTodoRepeatDto.repeatedTimes,
    };
    const entity = await this.todoRepeatRepository.create(todoRepeatEntity as TodoRepeat);
    const foundEntity = await this.todoRepeatRepository.find(entity.id);
    const todoRepeatDto = new TodoRepeatDto();
    todoRepeatDto.importEntity(foundEntity);
    return todoRepeatDto;
  }

  async delete(id: string): Promise<boolean> {
    return await this.todoRepeatRepository.delete(id);
  }
  async update(
    id: string,
    updateTodoRepeatDto: UpdateTodoRepeatDto
  ): Promise<TodoRepeatDto> {
    const todoRepeatUpdate: Partial<TodoRepeat> = {};
    if (updateTodoRepeatDto.name !== undefined) todoRepeatUpdate.name = updateTodoRepeatDto.name;
    if (updateTodoRepeatDto.description !== undefined) todoRepeatUpdate.description = updateTodoRepeatDto.description;
    if (updateTodoRepeatDto.importance !== undefined) todoRepeatUpdate.importance = updateTodoRepeatDto.importance;
    if (updateTodoRepeatDto.urgency !== undefined) todoRepeatUpdate.urgency = updateTodoRepeatDto.urgency;
    if (updateTodoRepeatDto.tags !== undefined) todoRepeatUpdate.tags = updateTodoRepeatDto.tags;
    if (updateTodoRepeatDto.status !== undefined) todoRepeatUpdate.status = updateTodoRepeatDto.status;
    if (updateTodoRepeatDto.repeatStartDate !== undefined) todoRepeatUpdate.repeatStartDate = updateTodoRepeatDto.repeatStartDate;
    if (updateTodoRepeatDto.currentDate !== undefined) todoRepeatUpdate.currentDate = updateTodoRepeatDto.currentDate;
    if (updateTodoRepeatDto.repeatMode !== undefined) todoRepeatUpdate.repeatMode = updateTodoRepeatDto.repeatMode;
    if (updateTodoRepeatDto.repeatConfig !== undefined) todoRepeatUpdate.repeatConfig = updateTodoRepeatDto.repeatConfig;
    if (updateTodoRepeatDto.repeatEndMode !== undefined) todoRepeatUpdate.repeatEndMode = updateTodoRepeatDto.repeatEndMode;
    if (updateTodoRepeatDto.repeatEndDate !== undefined) todoRepeatUpdate.repeatEndDate = updateTodoRepeatDto.repeatEndDate;
    if (updateTodoRepeatDto.repeatTimes !== undefined) todoRepeatUpdate.repeatTimes = updateTodoRepeatDto.repeatTimes;
    if (updateTodoRepeatDto.repeatedTimes !== undefined) todoRepeatUpdate.repeatedTimes = updateTodoRepeatDto.repeatedTimes;
    if (updateTodoRepeatDto.abandonedAt !== undefined) todoRepeatUpdate.abandonedAt = updateTodoRepeatDto.abandonedAt;
    
    const todoRepeatUpdateEntity = new TodoRepeat();
    todoRepeatUpdateEntity.id = id;
    Object.assign(todoRepeatUpdateEntity, todoRepeatUpdate);
    const entity = await this.todoRepeatRepository.update(todoRepeatUpdateEntity);
    const todoRepeatDto = new TodoRepeatDto();
    todoRepeatDto.importEntity(entity);
    return todoRepeatDto;
  }

  async findById(id: string): Promise<TodoRepeatDto> {
    const entity = await this.todoRepeatRepository.find(id);
    const todoRepeatDto = new TodoRepeatDto();
    todoRepeatDto.importEntity(entity);
    return todoRepeatDto;
  }

  async findAll(filter: TodoRepeatListFilterDto): Promise<TodoRepeatDto[]> {
    const entities = await this.todoRepeatRepository.findAll(filter);
    return entities.map((entity) => {
      const todoRepeatDto = new TodoRepeatDto();
      todoRepeatDto.importEntity(entity);
      return todoRepeatDto;
    });
  }

  async list(filter: TodoRepeatListFilterDto): Promise<TodoRepeatDto[]> {
    const entities = await this.todoRepeatRepository.findAll(filter);
    return entities.map((entity) => {
      const todoRepeatDto = new TodoRepeatDto();
      todoRepeatDto.importEntity(entity);
      return todoRepeatDto;
    });
  }

  async page(filter: TodoRepeatPageFiltersDto): Promise<{
    list: TodoRepeatDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const result = await this.todoRepeatRepository.page(filter);
    return {
      ...result,
      list: result.list.map((entity) => {
        const todoRepeatDto = new TodoRepeatDto();
        todoRepeatDto.importEntity(entity);
        return todoRepeatDto;
      }),
    };
  }

  // ====== 业务逻辑编排 ======

  async batchUpdate(
    includeIds: string[],
    updateTodoRepeatDto: UpdateTodoRepeatDto
  ): Promise<TodoRepeatDto[]> {
    const filterDto = new TodoRepeatListFilterDto();
    filterDto.includeIds = includeIds;
    const result = await this.todoRepeatRepository.updateByFilter(
      filterDto,
      updateTodoRepeatDto as any
    );
    return result as any;
  }


  async done(id: string): Promise<any> {
    const todoRepeatUpdateEntity = new TodoRepeat();
    todoRepeatUpdateEntity.id = id;
    todoRepeatUpdateEntity.status = TodoStatus.DONE;
    await this.todoRepeatRepository.update(todoRepeatUpdateEntity);
  }

  async abandon(id: string): Promise<any> {
    const todoRepeatUpdateEntity = new TodoRepeat();
    todoRepeatUpdateEntity.id = id;
    todoRepeatUpdateEntity.status = TodoStatus.ABANDONED;
    todoRepeatUpdateEntity.abandonedAt = new Date();
    await this.todoRepeatRepository.update(todoRepeatUpdateEntity);
  }

  async restore(id: string): Promise<any> {
    const todoRepeatUpdateEntity = new TodoRepeat();
    todoRepeatUpdateEntity.id = id;
    todoRepeatUpdateEntity.status = TodoStatus.TODO;
    todoRepeatUpdateEntity.abandonedAt = undefined;
    await this.todoRepeatRepository.update(todoRepeatUpdateEntity);
  }

  doneBatch(includeIds: string[]): Promise<any> {
    const updateTodoRepeatDto = new UpdateTodoRepeatDto();
    updateTodoRepeatDto.status = TodoStatus.DONE;
    const filterDto = new TodoRepeatListFilterDto();
    filterDto.includeIds = includeIds;
    return this.todoRepeatRepository.updateByFilter(
      filterDto,
      updateTodoRepeatDto as any
    );
  }

  /**
   * 基于 TodoListFilter 的日期范围，展开符合条件的重复待办为 TodoDto 列表
   * 不会落库，仅在内存中生成；若当日已有具体待办，则使用已存在的待办（并补充 repeat 信息）
   */
  async generateTodosInRange(filter: TodoFilterDto): Promise<TodoDto[]> {
    const rangeStart = filter.planDateStart
      ? dayjs(filter.planDateStart)
      : undefined;
    const rangeEnd = filter.planDateEnd ? dayjs(filter.planDateEnd) : undefined;

    const repeatFilter = new TodoRepeatListFilterDto();
    repeatFilter.currentDateStart = filter.planDateStart as any;
    repeatFilter.currentDateEnd = filter.planDateEnd as any;

    const repeatEntities = await this.todoRepeatRepository.findAll(repeatFilter);
    const results: TodoDto[] = [];

    for (const repeatEntity of repeatEntities) {
      const repeat = new TodoRepeatDto();
      repeat.importEntity(repeatEntity);
      // 结束条件预处理
      const endMode = repeat.repeatEndMode as RepeatEndMode | undefined;
      const endDate = repeat.repeatEndDate
        ? dayjs(repeat.repeatEndDate)
        : undefined;
      const maxTimes = repeat.repeatTimes ?? undefined;
      const alreadyTimes = repeat.repeatedTimes ?? 0;

      // 生成区间内的所有日期
      const repeatCfg: RepeatConfig = {
        repeatMode: repeat.repeatMode as any,
        repeatConfig: repeat.repeatConfig as any,
      } as RepeatConfig;

      const baseDate = repeat.currentDate ?? repeat.repeatStartDate;
      let cursor = baseDate
        ? dayjs(baseDate).subtract(1, "day")
        : dayjs(rangeStart).subtract(1, "day");
      let timesCount = alreadyTimes;

      while (true) {
        const next = calculateNextDate(cursor, repeatCfg);
        if (!next) break;

        // 次数限制（若设置 FOR_TIMES）
        if (endMode === RepeatEndMode.FOR_TIMES && maxTimes !== undefined) {
          if (timesCount >= maxTimes) break;
          timesCount += 1;
        }

        // 终止日期限制
        if (
          endMode === RepeatEndMode.TO_DATE &&
          endDate &&
          next.isAfter(endDate, "day")
        ) {
          break;
        }

        // 推进游标
        cursor = next;

        // 跳过范围外
        if (next.isBefore(rangeStart, "day")) continue;
        if (next.isAfter(rangeEnd, "day")) break;

        const todoDto = this.generateTodo(repeat);
        results.push(todoDto);
      }
    }

    return results;
  }

  generateTodo(todoRepeat: TodoRepeatDto) {
    const todoDto = new TodoDto();
    todoDto.id = todoRepeat.id;
    todoDto.name = todoRepeat.name;
    todoDto.importEntity({
      id: todoRepeat.id,
      name: todoRepeat.name,
      description: todoRepeat.description,
      tags: todoRepeat.tags || [],
      importance: todoRepeat.importance,
      urgency: todoRepeat.urgency,
      planDate: dayjs(todoRepeat.currentDate).toDate(),
      planStartAt: undefined,
      planEndAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      repeat: todoRepeat,
      originalRepeatId: todoRepeat.id,
      source: TodoSource.REPEAT,
      status: todoRepeat.status ?? TodoStatus.TODO,
    });
    return todoDto;
  }
}
