import { HabitRepository } from './habit.repository';
import { TodoRepository } from '../todo/todo.repository';
import { CreateHabitDto, UpdateHabitDto, HabitFilterDto, HabitPageFilterDto, HabitDto } from './dto';
import { Habit } from './habit.entity';
import { GoalStatus, HabitStatus, TodoRelatedType, TodoStatus } from '@true-north/enum';
import { GoalRepository } from '../goal/goal.repository';
import { Todo } from '../todo/todo.entity';
import { RepeatService, repeatService as defaultRepeatService } from '../repeat/repeat.service';

export class HabitService {
  habitRepository: HabitRepository;
  todoRepository: TodoRepository;
  goalRepository: GoalRepository;
  repeatService: RepeatService;

  constructor(
    habitRepository: HabitRepository,
    todoRepository: TodoRepository,
    goalRepository = new GoalRepository(),
    repeatService = defaultRepeatService
  ) {
    this.habitRepository = habitRepository;
    this.todoRepository = todoRepository;
    this.goalRepository = goalRepository;
    this.repeatService = repeatService;
  }

  // ====== 基础 CRUD ======
  async create(createHabitDto: CreateHabitDto): Promise<HabitDto> {
    this.repeatService.assertValidRepeat(createHabitDto);
    const repeat = await this.repeatService.create(createHabitDto.toRepeatRuleInput());
    const entity = createHabitDto.exportCreateEntity(repeat.id);
    entity.status = HabitStatus.ACTIVE;
    entity.goals = await this.resolveActiveGoals(createHabitDto.goalIds);
    const habit = await this.habitRepository.create(entity);
    const withRelations = await this.habitRepository.findWithRelations(habit.id);
    await this.createCycleTodo(withRelations);
    return HabitDto.importEntity(await this.habitRepository.findWithRelations(habit.id));
  }

  async delete(id: string): Promise<void> {
    const habit = await this.habitRepository.find(id);
    await this.habitRepository.delete(id);
    if (habit.repeatId) {
      try {
        await this.repeatService.repeatRepository.delete(habit.repeatId);
      } catch {
        // ignore orphan cleanup failure
      }
    }
  }

  async update(updateHabitDto: UpdateHabitDto): Promise<HabitDto> {
    const current = await this.habitRepository.findWithRelations(updateHabitDto.id);
    if (updateHabitDto.status !== undefined) {
      throw new Error('习惯状态只能通过开始、暂停、放弃或周期结束操作更新');
    }

    const nextRule = {
      repeatMode: updateHabitDto.repeatMode ?? current.repeat?.repeatMode,
      repeatConfig: updateHabitDto.repeatConfig !== undefined ? updateHabitDto.repeatConfig : current.repeat?.repeatConfig,
      repeatEndMode: updateHabitDto.repeatEndMode ?? current.repeat?.repeatEndMode,
      repeatEndDate: updateHabitDto.repeatEndDate !== undefined ? updateHabitDto.repeatEndDate : current.repeat?.repeatEndDate,
      repeatTimes: updateHabitDto.repeatTimes !== undefined ? updateHabitDto.repeatTimes : current.repeat?.repeatTimes,
      repeatStartDate: updateHabitDto.repeatStartDate ?? current.repeat?.repeatStartDate,
    };
    this.repeatService.assertValidRepeat(nextRule);

    if (updateHabitDto.hasRepeatRuleUpdate() && current.repeatId) {
      await this.repeatService.update(current.repeatId, updateHabitDto.toRepeatRulePartial());
    }

    const entity = updateHabitDto.exportUpdateEntity();
    if (updateHabitDto.goalIds !== undefined) {
      entity.goals = await this.resolveActiveGoals(updateHabitDto.goalIds);
    }
    await this.habitRepository.update(entity);
    return HabitDto.importEntity(await this.habitRepository.findWithRelations(updateHabitDto.id));
  }

  async find(id: string): Promise<HabitDto> {
    const entity = await this.habitRepository.findWithRelations(id);
    const dto = HabitDto.importEntity(entity);
    this.repeatService.assertValidRepeat(dto);
    return dto;
  }

  async findWithRelations(id: string): Promise<HabitDto> {
    const entity = await this.habitRepository.findWithRelations(id);
    const habitDto = new HabitDto();
    habitDto.importEntity(entity);
    this.repeatService.assertValidRepeat(habitDto);
    return habitDto;
  }

  async findByFilter(filter: HabitFilterDto): Promise<HabitDto[]> {
    const entities = await this.habitRepository.findByFilter(filter);
    return entities.map((entity) => {
      const dto = HabitDto.importEntity(entity);
      this.repeatService.assertValidRepeat(dto);
      return dto;
    });
  }

  async page(
    filter: HabitPageFilterDto
  ): Promise<{ list: HabitDto[]; total: number; pageNum: number; pageSize: number }> {
    const { list, total, pageNum, pageSize } = await this.habitRepository.page(filter);
    return {
      list: list.map((entity) => {
        const dto = HabitDto.importEntity(entity);
        this.repeatService.assertValidRepeat(dto);
        return dto;
      }),
      total,
      pageNum,
      pageSize,
    };
  }

  //  ====== 业务逻辑编排 ======
  async pause(id: string): Promise<void> {
    await this.transition(id, HabitStatus.ACTIVE, HabitStatus.PAUSED);
  }

  async activate(id: string): Promise<void> {
    const habit = await this.habitRepository.findWithRelations(id);
    if (habit.status !== HabitStatus.PAUSED && habit.status !== HabitStatus.ABANDONED) {
      throw new Error('当前状态不允许开始习惯');
    }
    habit.status = HabitStatus.ACTIVE;
    await this.habitRepository.update(habit);
    await this.createCycleTodo(habit);
  }

  async abandon(id: string): Promise<void> {
    const habit = await this.habitRepository.find(id);
    if (habit.status === HabitStatus.COMPLETED || habit.status === HabitStatus.ABANDONED) {
      throw new Error('当前状态不允许放弃习惯');
    }
    habit.status = HabitStatus.ABANDONED;
    habit.abandonedAt = new Date();
    if (habit.cycleTodoId) {
      const cycleTodo = await this.todoRepository.find(habit.cycleTodoId);
      if (cycleTodo.status === TodoStatus.TODO) {
        cycleTodo.status = TodoStatus.ABANDONED;
        cycleTodo.abandonedAt = habit.abandonedAt;
        await this.todoRepository.update(cycleTodo);
      }
      habit.cycleTodoId = undefined;
    }
    await this.habitRepository.update(habit);
  }

  private async transition(id: string, from: HabitStatus, to: HabitStatus): Promise<void> {
    const habit = await this.habitRepository.find(id);
    if (habit.status !== from) throw new Error('当前状态不允许该操作');
    habit.status = to;
    await this.habitRepository.update(habit);
  }

  private async resolveActiveGoals(goalIds?: string[]) {
    if (!goalIds?.length) throw new Error('习惯至少需要关联一个活跃目标');
    const goals = await Promise.all(goalIds.map((id) => this.goalRepository.find(id)));
    const inactive = goals.find((goal) => goal.status !== GoalStatus.TODO && goal.status !== GoalStatus.DOING);
    if (inactive) throw new Error(`目标“${inactive.name}”不是活跃目标`);
    return goals;
  }

  private async createCycleTodo(habit: Habit): Promise<void> {
    if (habit.status !== HabitStatus.ACTIVE || habit.cycleTodoId) return;
    const planDate = habit.repeat?.currentDate || habit.repeat?.repeatStartDate;
    if (!planDate) throw new Error('习惯缺少重复开始日期');

    const todo = new Todo();
    todo.name = habit.name;
    todo.description = habit.description;
    todo.importance = habit.importance;
    todo.planDate = new Date(planDate);
    todo.status = TodoStatus.TODO;
    todo.relatedType = TodoRelatedType.HABIT;
    todo.relatedId = habit.id;
    const saved = await this.todoRepository.create(todo);
    habit.cycleTodoId = saved.id;
    habit.cycleCount = Math.max(1, habit.cycleCount || 0);
    await this.habitRepository.update(habit);
  }
}

export const habitService = new HabitService(new HabitRepository(), new TodoRepository());
