import { TodoRepeatRepository } from "./todo-repeat.repository";
import {
  CreateTodoRepeatDto,
  UpdateTodoRepeatDto,
  TodoRepeatPageFiltersDto,
  TodoRepeatListFilterDto,
  TodoRepeatDto,
} from "./dto";
import {
  RepeatEndMode,
  Repeat as RepeatConfig,
} from "@life-toolkit/components-repeat/types";
import { calculateNextDate } from "@life-toolkit/components-repeat/common";
import {
  CreateTodoDto,
  TodoDto,
  Todo,
  TodoListFilterDto,
} from "@life-toolkit/business-server";
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
    const todoRepeat =
      await this.todoRepeatRepository.create(createTodoRepeatDto);
    return await this.todoRepeatRepository.findById(todoRepeat.id);
  }

  async delete(id: string): Promise<boolean> {
    return await this.todoRepeatRepository.delete(id);
  }
  async update(
    id: string,
    updateTodoRepeatDto: UpdateTodoRepeatDto
  ): Promise<TodoRepeatDto> {
    const todoRepeat = await this.todoRepeatRepository.update(
      id,
      updateTodoRepeatDto
    );
    return await this.todoRepeatRepository.findById(id);
  }

  async findById(id: string): Promise<TodoRepeatDto> {
    return await this.todoRepeatRepository.findById(id);
  }

  async findAll(filter: TodoRepeatListFilterDto): Promise<TodoRepeatDto[]> {
    return await this.todoRepeatRepository.findAll(filter);
  }

  // ====== 业务逻辑编排 ======

  async list(filter: TodoRepeatListFilterDto): Promise<TodoRepeatDto[]> {
    const list = await this.todoRepeatRepository.findAll(filter);
    return list;
  }

  async page(filter: TodoRepeatPageFiltersDto): Promise<{
    list: TodoRepeatDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const { list, total, pageNum, pageSize } =
      await this.todoRepeatRepository.page(filter);
    return { list, total, pageNum, pageSize };
  }

  async batchUpdate(
    idList: string[],
    updateTodoRepeatDto: UpdateTodoRepeatDto
  ): Promise<TodoRepeatDto[]> {
    return await this.todoRepeatRepository.batchUpdate(
      idList,
      updateTodoRepeatDto
    );
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
    updateTodoRepeatDto.abandonedAt = undefined;
    await this.todoRepeatRepository.update(id, updateTodoRepeatDto);
  }

  batchDone(idList: string[]): Promise<any> {
    const updateTodoRepeatDto = new UpdateTodoRepeatDto();
    updateTodoRepeatDto.status = TodoStatus.DONE;
    return this.todoRepeatRepository.batchUpdate(idList, updateTodoRepeatDto);
  }

  /**
   * 基于 TodoListFilter 的日期范围，展开符合条件的重复待办为 TodoDto 列表
   * 不会落库，仅在内存中生成；若当日已有具体待办，则使用已存在的待办（并补充 repeat 信息）
   */
  async generateTodosInRange(filter: TodoListFilterDto): Promise<TodoDto[]> {
    const rangeStart = filter.planDateStart
      ? dayjs(filter.planDateStart)
      : undefined;
    const rangeEnd = filter.planDateEnd ? dayjs(filter.planDateEnd) : undefined;

    const repeatFilter = new TodoRepeatListFilterDto();
    repeatFilter.currentDateStart = filter.planDateStart as any;
    repeatFilter.currentDateEnd = filter.planDateEnd as any;

    const repeatList = await this.todoRepeatRepository.findAll(repeatFilter);
    const results: TodoDto[] = [];

    for (const repeat of repeatList) {
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

        const temp: Partial<Todo> = {
          originalRepeatId: repeat.id,
          source: TodoSource.REPEAT,
          status: repeat.status ?? TodoStatus.TODO,
        };

        // 不落库，构造一个 TodoDto 形态的数据
        const fake: any = {
          ...temp,
          id: repeat.id,
          name: repeat.name,
          description: repeat.description,
          tags: repeat.tags,
          importance: repeat.importance,
          urgency: repeat.urgency,
          planDate: next.toDate(),
          planStartAt: undefined,
          planEndAt: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          repeat: repeat,
        };
        const todoDto = new TodoDto();
        todoDto.id = repeat.id;
        todoDto.name = repeat.name;
        todoDto.importEntity(fake);
        results.push(todoDto);
      }
    }

    return results;
  }
}
