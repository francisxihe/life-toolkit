import { HabitRepository } from './habit.repository';
import { TodoRepository } from '../todo/todo.repository';
import { CreateHabitDto, UpdateHabitDto, HabitFilterDto, HabitPageFilterDto, HabitDto } from './dto';
import { Habit } from './habit.entity';
import { HabitStatus, TodoStatus } from '@life-toolkit/enum';

export class HabitService {
  habitRepository: HabitRepository;
  todoRepository: TodoRepository;

  constructor(habitRepository: HabitRepository, todoRepository: TodoRepository) {
    this.habitRepository = habitRepository;
    this.todoRepository = todoRepository;
  }

  // ====== 基础 CRUD ======
  async create(createHabitDto: CreateHabitDto): Promise<HabitDto> {
    const entity = await this.habitRepository.create(createHabitDto.exportCreateEntity());
    const habitDto = new HabitDto();
    habitDto.importEntity(entity);
    return habitDto;
  }

  async delete(id: string): Promise<void> {
    await this.habitRepository.delete(id);
  }

  async update(updateHabitDto: UpdateHabitDto): Promise<HabitDto> {
    const entity = await this.habitRepository.update(updateHabitDto.exportUpdateEntity());
    const habitDto = new HabitDto();
    habitDto.importEntity(entity);
    return habitDto;
  }


  async find(id: string): Promise<HabitDto> {
    const entity = await this.habitRepository.find(id);
    return HabitDto.importEntity(entity);
  }

  async findByFilter(filter: HabitFilterDto): Promise<HabitDto[]> {
    const entities = await this.habitRepository.findByFilter(filter);
    return entities.map((entity) => HabitDto.importEntity(entity));
  }

  async page(
    filter: HabitPageFilterDto
  ): Promise<{ list: HabitDto[]; total: number; pageNum: number; pageSize: number }> {
    const { list, total, pageNum, pageSize } = await this.habitRepository.page(filter);
    return {
      list: list.map((entity) => HabitDto.importEntity(entity)),
      total,
      pageNum,
      pageSize,
    };
  }

  //  ====== 业务逻辑编排 ======
 

  async getHabitTodos(habitId: string): Promise<{
    activeTodos: any[];
    completedTodos: any[];
    abandonedTodos: any[];
    totalCount: number;
  }> {
    // 使用TodoRepository的findAll方法查询不同状态的todos
    const activeFilter = { habitId, status: [TodoStatus.TODO] };
    const completedFilter = { habitId, status: [TodoStatus.DONE] };
    const abandonedFilter = { habitId, status: [TodoStatus.ABANDONED] };

    const [activeTodos, completedTodos, abandonedTodos] = await Promise.all([
      this.todoRepository.findByFilter(activeFilter as any),
      this.todoRepository.findByFilter(completedFilter as any),
      this.todoRepository.findByFilter(abandonedFilter as any),
    ]);

    const totalCount = activeTodos.length + completedTodos.length + abandonedTodos.length;
    return { activeTodos, completedTodos, abandonedTodos, totalCount };
  }

  async getHabitAnalytics(habitId: string): Promise<{
    totalTodos: number;
    completedTodos: number;
    abandonedTodos: number;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
    recentTodos: any[];
  }> {
    const habitEntity = await this.habitRepository.find(habitId);
    const habit = HabitDto.importEntity(habitEntity);

    // 使用TodoRepository查询分析数据
    const [allTodos, completedTodos, abandonedTodos, recentTodos] = await Promise.all([
      this.todoRepository.findByFilter({ habitId } as any),
      this.todoRepository.findByFilter({ habitId, status: [TodoStatus.DONE] } as any),
      this.todoRepository.findByFilter({ habitId, status: [TodoStatus.ABANDONED] } as any),
      this.todoRepository.findByFilter({ habitId } as any), // 这里需要添加排序和限制逻辑
    ]);

    // 对最近的todos进行排序和限制（取最新的10条）
    const sortedRecentTodos = recentTodos
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);

    const totalTodos = allTodos.length;
    const completionRate = totalTodos > 0 ? (completedTodos.length / totalTodos) * 100 : 0;

    return {
      totalTodos,
      completedTodos: completedTodos.length,
      abandonedTodos: abandonedTodos.length,
      completionRate,
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      recentTodos: sortedRecentTodos,
    };
  }

  async abandon(id: string): Promise<void> {
    await this.update(id, Object.assign(new UpdateHabitDto(), { status: HabitStatus.ABANDONED }));
  }

  async restore(id: string): Promise<void> {
    await this.update(id, Object.assign(new UpdateHabitDto(), { status: HabitStatus.ACTIVE }));
  }

  async pauseHabit(id: string): Promise<void> {
    await this.update(id, Object.assign(new UpdateHabitDto(), { status: HabitStatus.PAUSED }));
  }

  async resumeHabit(id: string): Promise<void> {
    await this.update(id, Object.assign(new UpdateHabitDto(), { status: HabitStatus.ACTIVE }));
  }

  async completeHabit(id: string): Promise<void> {
    await this.update(
      id,
      Object.assign(new UpdateHabitDto(), {
        status: HabitStatus.COMPLETED,
        targetDate: new Date(),
      })
    );
  }
}
