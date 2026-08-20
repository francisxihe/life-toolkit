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
import { RepeatEndMode } from '@true-north/components-repeat/types';
import { TodoStatus, TodoRelatedType, TodoRepeatStatus } from '@true-north/enum';
import dayjs from 'dayjs';
import { RepeatService, repeatService as defaultRepeatService } from '../repeat/repeat.service';
import { TodoRepository } from './todo.repository';

export class TodoRepeatService {
  todoRepeatRepository: TodoRepeatRepository;
  repeatService: RepeatService;
  todoRepository: TodoRepository;

  constructor(
    todoRepeatRepository: TodoRepeatRepository,
    repeatService = defaultRepeatService,
    todoRepository = new TodoRepository()
  ) {
    this.todoRepeatRepository = todoRepeatRepository;
    this.repeatService = repeatService;
    this.todoRepository = todoRepository;
  }

  // ====== 基础 CRUD ======

  async create(createTodoRepeatDto: CreateTodoRepeatDto): Promise<TodoRepeatDto> {
    this.repeatService.assertValidRepeat(createTodoRepeatDto);
    const rule = this.repeatService.fixCurrentDate(createTodoRepeatDto.toRepeatRuleInput());
    const repeat = await this.repeatService.create(rule);
    const entity = await this.todoRepeatRepository.create(
      createTodoRepeatDto.exportCreateEntity(repeat.id)
    );
    return this.toDto(await this.todoRepeatRepository.findWithRelations(entity.id));
  }

  /** 删除系列定义与调度；不级联删除已物化的 relatedType=repeat 历史 todo */
  async delete(id: string): Promise<boolean> {
    try {
      const current = await this.todoRepeatRepository.findWithRelations(id);
      await this.todoRepeatRepository.delete(id);
      if (current.repeatId) {
        try {
          await this.repeatService.repeatRepository.delete(current.repeatId);
        } catch {
          // repeat 可能已被其他主人共用；独立 repeat_todo 场景下删除即可
        }
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  async update(updateTodoRepeatDto: UpdateTodoRepeatDto): Promise<TodoRepeatDto> {
    const currentEntity = await this.todoRepeatRepository.findWithRelations(updateTodoRepeatDto.id);
    updateTodoRepeatDto.importUpdateEntity(currentEntity);

    if (updateTodoRepeatDto.hasRepeatRuleUpdate()) {
      this.repeatService.assertValidRepeat({
        repeatMode: updateTodoRepeatDto.repeatMode,
        repeatConfig: updateTodoRepeatDto.repeatConfig,
        repeatEndMode: updateTodoRepeatDto.repeatEndMode,
        repeatEndDate: updateTodoRepeatDto.repeatEndDate,
        repeatTimes: updateTodoRepeatDto.repeatTimes,
        repeatStartDate: updateTodoRepeatDto.repeatStartDate,
      });
      if (currentEntity.repeatId) {
        await this.repeatService.update(currentEntity.repeatId, updateTodoRepeatDto.toRepeatRulePartial());
      }
    }

    await this.todoRepeatRepository.update(updateTodoRepeatDto.exportUpdateEntity());
    return this.toDto(await this.todoRepeatRepository.findWithRelations(updateTodoRepeatDto.id));
  }

  async findWithRelations(id: string): Promise<TodoRepeatDto> {
    const entity = await this.todoRepeatRepository.findWithRelations(id);
    const dto = this.toDto(entity);
    this.repeatService.assertValidRepeat(dto);
    return dto;
  }

  async findByFilter(filter: TodoRepeatFilterDto): Promise<TodoRepeatDto[]> {
    const entities = await this.todoRepeatRepository.findByFilter(filter);
    return entities.map((entity) => {
      const dto = this.toDto(entity);
      this.repeatService.assertValidRepeat(dto);
      return dto;
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
        const dto = this.toDto(entity);
        this.repeatService.assertValidRepeat(dto);
        return dto;
      }),
    };
  }

  // ====== 业务逻辑编排 ======

  async batchUpdate(includeIds: string[], updateTodoRepeatDto: UpdateTodoRepeatDto): Promise<TodoRepeatDto[]> {
    const results: TodoRepeatDto[] = [];
    for (const id of includeIds) {
      const dto = new UpdateTodoRepeatDto();
      Object.assign(dto, updateTodoRepeatDto);
      dto.id = id;
      results.push(await this.update(dto));
    }
    return results;
  }

  /** 将 repeat_todo 标记为最终结束状态（无下一实例时） */
  async finish(id: string, status: TodoRepeatStatus.ENDED | TodoRepeatStatus.ABANDONED): Promise<void> {
    const updateTodoRepeatDto = new UpdateTodoRepeatDto();
    updateTodoRepeatDto.id = id;
    updateTodoRepeatDto.status = status;
    if (status === TodoRepeatStatus.ABANDONED) {
      updateTodoRepeatDto.abandonedAt = new Date();
    }
    await this.update(updateTodoRepeatDto);
  }

  async restore(id: string): Promise<any> {
    const todoRepeatUpdateEntity = new TodoRepeat();
    todoRepeatUpdateEntity.id = id;
    todoRepeatUpdateEntity.status = TodoRepeatStatus.ACTIVE;
    todoRepeatUpdateEntity.abandonedAt = undefined;
    await this.todoRepeatRepository.update(todoRepeatUpdateEntity);
  }

  /**
   * 结算当前实例：返回结算前内容快照（含 settled currentDate）；推进游标由 RepeatService 完成。
   * nextDate 为 null 表示重复计划已结束。
   */
  async settleCurrent(id: string): Promise<{ settled: TodoRepeatDto; nextDate: string | null }> {
    const todoRepeatDto = await this.findWithRelations(id);
    if (todoRepeatDto.status !== TodoRepeatStatus.ACTIVE) {
      throw new Error('当前状态不允许结算周期待办');
    }
    if (!todoRepeatDto.repeatId) {
      throw new Error('缺少关联的重复规则');
    }

    const { settledCurrentDate, nextDate } = await this.repeatService.settleCurrent(todoRepeatDto.repeatId);
    const settledSnapshot = new TodoRepeatDto();
    Object.assign(settledSnapshot, todoRepeatDto);
    settledSnapshot.currentDate = settledCurrentDate;

    return { settled: settledSnapshot, nextDate };
  }

  /**
   * 基于 TodoListFilter 的日期范围，展开符合条件的 repeat_todo 为 TodoDto 列表
   * 不会落库，仅在内存中生成
   */
  async generateTodoByRepeat(todoFilter: TodoFilterDto): Promise<TodoDto[]> {
    if (todoFilter.status && todoFilter.status !== TodoStatus.TODO) {
      return [];
    }
    const rangeStart = todoFilter.planDateStart ? dayjs(todoFilter.planDateStart) : undefined;
    const rangeEnd = todoFilter.planDateEnd ? dayjs(todoFilter.planDateEnd) : undefined;

    const repeatFilter = new TodoRepeatFilterDto();
    repeatFilter.currentDateStart = todoFilter.planDateStart;
    repeatFilter.currentDateEnd = todoFilter.planDateEnd;
    repeatFilter.status = TodoRepeatStatus.ACTIVE;

    const todoRepeatList = await this.todoRepeatRepository.findByFilter(repeatFilter);
    const results: TodoDto[] = [];

    for (const todoRepeat of todoRepeatList) {
      const todoRepeatDto = this.toDto(todoRepeat);
      if (todoRepeatDto.status !== TodoRepeatStatus.ACTIVE) {
        continue;
      }

      const endMode = todoRepeatDto.repeatEndMode as RepeatEndMode | undefined;
      const endDate = todoRepeatDto.repeatEndDate ? dayjs(todoRepeatDto.repeatEndDate) : undefined;
      const maxTimes = todoRepeatDto.repeatTimes ?? undefined;

      if (todoRepeatDto.repeatId) {
        const fixed = this.repeatService.fixCurrentDate({
          repeatMode: todoRepeatDto.repeatMode,
          repeatConfig: todoRepeatDto.repeatConfig,
          repeatEndMode: todoRepeatDto.repeatEndMode,
          repeatEndDate: todoRepeatDto.repeatEndDate,
          repeatTimes: todoRepeatDto.repeatTimes,
          repeatStartDate: todoRepeatDto.repeatStartDate,
          currentDate: todoRepeatDto.currentDate,
        });
        todoRepeatDto.currentDate = fixed.currentDate || fixed.repeatStartDate;
      }

      const targetDate = todoRepeatDto.currentDate ? dayjs(todoRepeatDto.currentDate) : null;
      if (!targetDate) continue;

      if (rangeStart && targetDate.isBefore(rangeStart, 'day')) continue;
      if (rangeEnd && targetDate.isAfter(rangeEnd, 'day')) continue;

      if (endMode === RepeatEndMode.FOR_TIMES) {
        const settledCount = await this.countSettledTodos(todoRepeatDto.id);
        if (settledCount >= (maxTimes || 0)) continue;
      }

      if (endMode === RepeatEndMode.TO_DATE && endDate && targetDate.isAfter(endDate, 'day')) {
        continue;
      }

      results.push(this.generateTodo(todoRepeatDto, targetDate.toDate()));
    }

    return results;
  }

  generateTodo(todoRepeat: TodoRepeatDto, planDate?: Date): TodoDto {
    const todoDto = new TodoDto();
    todoDto.id = todoRepeat.id;
    todoDto.name = todoRepeat.name;
    todoDto.description = todoRepeat.description;
    todoDto.importance = todoRepeat.importance;
    todoDto.urgency = todoRepeat.urgency;
    todoDto.planDate = planDate || dayjs(todoRepeat.currentDate).toDate();
    todoDto.planStartTime = todoRepeat.planStartTime;
    todoDto.planEndTime = todoRepeat.planEndTime;
    todoDto.relatedType = TodoRelatedType.IS_REPEAT;
    todoDto.relatedId = todoRepeat.id;
    todoDto.status = TodoStatus.TODO;
    todoDto.createdAt = new Date() as any;
    todoDto.updatedAt = new Date() as any;
    todoDto.repeatConfig = {
      currentDate: todoRepeat.currentDate,
      repeatStartDate: todoRepeat.repeatStartDate,
      repeatMode: todoRepeat.repeatMode,
      repeatConfig: todoRepeat.repeatConfig,
      repeatEndMode: todoRepeat.repeatEndMode,
      repeatEndDate: todoRepeat.repeatEndDate,
      repeatTimes: todoRepeat.repeatTimes,
    };
    return todoDto;
  }

  private async countSettledTodos(repeatTodoId: string): Promise<number> {
    return this.todoRepository.repo.count({
      where: {
        relatedType: TodoRelatedType.REPEAT,
        relatedId: repeatTodoId,
      } as any,
    });
  }

  private toDto(entity: TodoRepeat): TodoRepeatDto {
    const dto = new TodoRepeatDto();
    dto.importEntity(entity);
    return dto;
  }
}
