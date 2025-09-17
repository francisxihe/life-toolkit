import { TodoRepeatRepository } from './todo-repeat.repository';
import {
  CreateTodoRepeatDto,
  UpdateTodoRepeatDto,
  TodoRepeatPageFilterDto,
  TodoRepeatFilterDto,
  TodoRepeatDto,
  TodoFilterDto,
  TodoDto,
} from './dto';
import { TodoRepeat } from './todo-repeat.entity';
import { Repeat as RepeatConfig, calculateNextDate, isValidDate } from '@life-toolkit/service-repeat-helpers';
import { RepeatEndMode } from '@life-toolkit/service-repeat-types';
import { TodoStatus, TodoSource } from '@life-toolkit/enum';
import dayjs from 'dayjs';

export class TodoRepeatService {
  todoRepeatRepository: TodoRepeatRepository;

  constructor(todoRepeatRepository: TodoRepeatRepository) {
    this.todoRepeatRepository = todoRepeatRepository;
  }

  // ====== 基础 CRUD ======

  async create(createTodoRepeatDto: CreateTodoRepeatDto): Promise<TodoRepeatDto> {
    const entity = await this.todoRepeatRepository.create(createTodoRepeatDto.exportCreateEntity());
    const todoRepeatDto = new TodoRepeatDto();
    todoRepeatDto.importEntity(entity);
    return todoRepeatDto;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.todoRepeatRepository.delete(id);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async update(updateTodoRepeatDto: UpdateTodoRepeatDto): Promise<TodoRepeatDto> {
    const entity = await this.todoRepeatRepository.update(updateTodoRepeatDto.exportUpdateEntity());
    const todoRepeatDto = new TodoRepeatDto();
    todoRepeatDto.importEntity(entity);
    return todoRepeatDto;
  }

  async findWithRelations(id: string): Promise<TodoRepeatDto> {
    const entity = await this.todoRepeatRepository.findWithRelations(id);
    const todoRepeatDto = new TodoRepeatDto();
    todoRepeatDto.importEntity(entity);
    return todoRepeatDto;
  }

  async findByFilter(filter: TodoRepeatFilterDto): Promise<TodoRepeatDto[]> {
    const entities = await this.todoRepeatRepository.findByFilter(filter);
    return entities.map((entity) => {
      const todoRepeatDto = new TodoRepeatDto();
      todoRepeatDto.importEntity(entity);
      return todoRepeatDto;
    });
  }

  async list(filter: TodoRepeatFilterDto): Promise<TodoRepeatDto[]> {
    const entities = await this.todoRepeatRepository.findByFilter(filter);
    return entities.map((entity) => {
      const todoRepeatDto = new TodoRepeatDto();
      todoRepeatDto.importEntity(entity);
      return todoRepeatDto;
    });
  }

  async page(filter: TodoRepeatPageFilterDto): Promise<{
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

  async batchUpdate(includeIds: string[], updateTodoRepeatDto: UpdateTodoRepeatDto): Promise<TodoRepeatDto[]> {
    const filterDto = new TodoRepeatFilterDto();
    filterDto.includeIds = includeIds;
    const result = await this.todoRepeatRepository.updateByFilter(filterDto, updateTodoRepeatDto as any);
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

  async updateToNext(id: string): Promise<TodoRepeatDto> {
    const todoRepeatDto = await this.findWithRelations(id);
    const repeatConfig = {
      repeatMode: todoRepeatDto.repeatMode,
      repeatConfig: todoRepeatDto.repeatConfig,
      repeatEndMode: todoRepeatDto.repeatEndMode,
      repeatEndDate: todoRepeatDto.repeatEndDate,
      repeatTimes: todoRepeatDto.repeatTimes,
      repeatStartDate: todoRepeatDto.repeatStartDate,
    };
    let currentDate = dayjs(todoRepeatDto.currentDate);
    let nextDate: dayjs.Dayjs;

    // 验证当前日期是否符合重复规则
    const isCurrentDateValid = isValidDate(currentDate, repeatConfig);

    if (!isCurrentDateValid) {
      // 如果当前日期不符合规则，找到下一个符合条件的日期
      const validNextDate = calculateNextDate(currentDate.subtract(1, 'day'), repeatConfig);

      if (!validNextDate) {
        throw new Error('No valid next date found');
      }
      currentDate = validNextDate;
    }

    // 当前日期符合规则，计算下一个日期
    const calculatedNextDate = calculateNextDate(currentDate, repeatConfig);

    if (!calculatedNextDate) {
      throw new Error('No next date found');
    }
    nextDate = calculatedNextDate;

    const updateTodoRepeatDto = new UpdateTodoRepeatDto();
    updateTodoRepeatDto.id = todoRepeatDto.id;
    updateTodoRepeatDto.currentDate = nextDate.format('YYYY-MM-DD');
    await this.update(updateTodoRepeatDto);
    return todoRepeatDto;
  }

  /**
   * 基于 TodoListFilter 的日期范围，展开符合条件的重复待办为 TodoDto 列表
   * 不会落库，仅在内存中生成；若当日已有具体待办，则使用已存在的待办（并补充 repeat 信息）
   */
  async generateTodoByRepeat(todoFilter: TodoFilterDto): Promise<TodoDto[]> {
    if (todoFilter.status !== TodoStatus.TODO) {
      return [];
    }
    const rangeStart = todoFilter.planDateStart ? dayjs(todoFilter.planDateStart) : undefined;
    const rangeEnd = todoFilter.planDateEnd ? dayjs(todoFilter.planDateEnd) : undefined;

    const repeatFilter = new TodoRepeatFilterDto();
    repeatFilter.currentDateStart = todoFilter.planDateStart;
    repeatFilter.currentDateEnd = todoFilter.planDateEnd;

    const todoRepeatList = await this.todoRepeatRepository.findByFilter(repeatFilter);
    const results: TodoDto[] = [];

    for (const todoRepeat of todoRepeatList) {
      const todoRepeatDto = new TodoRepeatDto();
      todoRepeatDto.importEntity(todoRepeat);

      // 结束条件预处理
      const endMode = todoRepeatDto.repeatEndMode as RepeatEndMode | undefined;
      const endDate = todoRepeatDto.repeatEndDate ? dayjs(todoRepeatDto.repeatEndDate) : undefined;
      const maxTimes = todoRepeatDto.repeatTimes ?? undefined;

      // 生成区间内的所有日期
      const repeatConfig: RepeatConfig = {
        repeatStartDate: todoRepeatDto.repeatStartDate,
        repeatMode: todoRepeatDto.repeatMode,
        repeatConfig: todoRepeatDto.repeatConfig,
        repeatEndMode: todoRepeatDto.repeatEndMode,
        repeatEndDate: todoRepeatDto.repeatEndDate,
        repeatTimes: todoRepeatDto.repeatTimes,
      };

      // 确定生成待办的日期
      let targetDate = todoRepeatDto.currentDate ? dayjs(todoRepeatDto.currentDate) : null;

      if (!targetDate) {
        continue; // 没有当前日期，跳过
      }

      // 如果当前日期不符合重复规则，找到下一个符合条件的日期
      if (!isValidDate(targetDate, repeatConfig)) {
        const nextValidDate = calculateNextDate(targetDate.subtract(1, 'day'), repeatConfig);
        if (!nextValidDate) {
          continue; // 找不到下一个有效日期，跳过
        }
        targetDate = nextValidDate;
      }

      // 检查目标日期是否在查询范围内
      if (rangeStart && targetDate.isBefore(rangeStart, 'day')) {
        continue;
      }
      if (rangeEnd && targetDate.isAfter(rangeEnd, 'day')) {
        continue;
      }

      // 次数限制检查（若设置 FOR_TIMES）
      if (endMode === RepeatEndMode.FOR_TIMES) {
        const repeatTodo = await this.findWithRelations(todoRepeatDto.id);
        if ((repeatTodo?.todos?.length ?? 0) >= (maxTimes || 0)) {
          continue;
        }
      }

      // 终止日期限制检查
      if (endMode === RepeatEndMode.TO_DATE && endDate && targetDate.isAfter(endDate, 'day')) {
        continue;
      }

      // 生成目标日期的待办
      const todoDto = this.generateTodo(todoRepeatDto, targetDate.toDate());
      results.push(todoDto);
    }

    return results;
  }

  generateTodo(todoRepeat: TodoRepeatDto, planDate?: Date): TodoDto {
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
      planDate: planDate || dayjs(todoRepeat.currentDate).toDate(),
      planStartAt: undefined,
      planEndAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      repeat: todoRepeat,
      source: TodoSource.IS_REPEAT,
      status: TodoStatus.TODO,
    });
    return todoDto;
  }
}
