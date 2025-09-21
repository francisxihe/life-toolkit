import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  CreateHabitDto,
  UpdateHabitDto,
  HabitFilterDto,
  HabitPageFilterDto,
  HabitDto,
  Habit,
  Goal,
  Todo,
} from '@life-toolkit/business-server';
import { HabitRepository as _HabitRepository } from '@life-toolkit/business-server';
import { HabitStatus, TodoStatus } from '@life-toolkit/enum';

@Injectable()
export class HabitRepository implements _HabitRepository {
  constructor(
    @InjectRepository(Habit)
    private readonly habitRepository: Repository<Habit>,
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>
  ) {}

  // 基础 CRUD 操作
  async create(createHabitDto: CreateHabitDto): Promise<HabitDto> {
    const habit = this.habitRepository.create({
      name: createHabitDto.name,
      description: createHabitDto.description,
      importance: createHabitDto.importance,
      tags: createHabitDto.tags || [],
      difficulty: createHabitDto.difficulty,
      startDate: createHabitDto.startDate,
      targetDate: createHabitDto.targetDate,
    });

    // 处理目标关联
    if (createHabitDto.goalIds && createHabitDto.goalIds.length > 0) {
      const goals = await this.goalRepository.findBy({
        id: In(createHabitDto.goalIds),
      });
      habit.goals = goals;
    }

    const savedHabit = await this.habitRepository.save(habit);
    const dto = new HabitDto();
    dto.importEntity(savedHabit);
    return dto;
  }

  async findWithRelations(id: string, relations?: string[]): Promise<HabitDto> {
    const habit = await this.habitRepository.findOne({
      where: { id },
      relations,
    });
    if (!habit) {
      throw new NotFoundException(`习惯记录不存在，ID: ${id}`);
    }
    const dto = new HabitDto();
    dto.importEntity(habit);
    return dto;
  }

  async findByFilter(filter: HabitFilterDto): Promise<HabitDto[]> {
    const query = this.buildQuery(filter);
    const habits = await query.getMany();
    return habits.map((habit) => {
      const dto = new HabitDto();
      dto.importEntity(habit);
      return dto;
    });
  }

  async page(
    filter: HabitPageFilterDto
  ): Promise<{ list: HabitDto[]; total: number; pageNum: number; pageSize: number }> {
    const { pageNum = 1, pageSize = 10 } = filter;
    const skip = (pageNum - 1) * pageSize;

    const query = this.buildQuery(filter);
    const [habits, total] = await query.skip(skip).take(pageSize).getManyAndCount();

    return {
      list: habits.map((habit) => {
        const dto = new HabitDto();
        dto.importEntity(habit);
        return dto;
      }),
      total,
      pageNum,
      pageSize,
    };
  }

  async update(id: string, updateHabitDto: UpdateHabitDto): Promise<HabitDto> {
    const habit = await this.habitRepository.findOne({ where: { id } });
    if (!habit) {
      throw new NotFoundException(`习惯记录不存在，ID: ${id}`);
    }

    // 处理目标关联更新
    if (updateHabitDto.goalIds !== undefined) {
      if (updateHabitDto.goalIds.length > 0) {
        const goals = await this.goalRepository.findBy({
          id: In(updateHabitDto.goalIds),
        });
        habit.goals = goals;
      } else {
        habit.goals = [];
      }
    }

    // 手动更新字段
    if (updateHabitDto.name !== undefined) {
      habit.name = updateHabitDto.name;
    }
    if (updateHabitDto.description !== undefined) {
      habit.description = updateHabitDto.description;
    }
    if (updateHabitDto.importance !== undefined) {
      habit.importance = updateHabitDto.importance;
    }
    if (updateHabitDto.tags !== undefined) {
      habit.tags = updateHabitDto.tags || [];
    }
    if (updateHabitDto.difficulty !== undefined) {
      habit.difficulty = updateHabitDto.difficulty;
    }
    if (updateHabitDto.startDate !== undefined) {
      habit.startDate = updateHabitDto.startDate;
    }
    if (updateHabitDto.targetDate !== undefined) {
      habit.targetDate = updateHabitDto.targetDate;
    }
    if (updateHabitDto.status !== undefined) {
      habit.status = updateHabitDto.status;
    }
    if (updateHabitDto.currentStreak !== undefined) {
      habit.currentStreak = updateHabitDto.currentStreak;
    }
    if (updateHabitDto.longestStreak !== undefined) {
      habit.longestStreak = updateHabitDto.longestStreak;
    }
    if (updateHabitDto.completedCount !== undefined) {
      habit.completedCount = updateHabitDto.completedCount;
    }

    const savedHabit = await this.habitRepository.save(habit);
    const dto = new HabitDto();
    dto.importEntity(savedHabit);
    return dto;
  }

  async delete(id: string): Promise<void> {
    const habit = await this.habitRepository.findOne({ where: { id } });
    if (!habit) {
      throw new NotFoundException(`习惯记录不存在，ID: ${id}`);
    }
    await this.habitRepository.remove(habit);
  }

  async softDelete(id: string): Promise<void> {
    const result = await this.habitRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`习惯记录不存在，ID: ${id}`);
    }
  }

  async batchUpdate(ids: string[], updateData: Partial<any>): Promise<void> {
    await this.habitRepository.update({ id: In(ids) }, updateData);
  }

  async updateStatus(id: string, status: HabitStatus, additionalData?: Record<string, any>): Promise<void> {
    const updateData = { status, ...additionalData };
    await this.habitRepository.update({ id }, updateData);
  }

  /**
   * 获取习惯关联的待办事项（按状态分组）
   */
  async getHabitTodos(habitId: string): Promise<{
    activeTodos: Todo[];
    completedTodos: Todo[];
    abandonedTodos: Todo[];
    totalCount: number;
  }> {
    const activeTodos = await this.todoRepository.find({
      where: { habitId, status: TodoStatus.TODO },
      order: { createdAt: 'DESC' },
    });

    const completedTodos = await this.todoRepository.find({
      where: { habitId, status: TodoStatus.DONE },
      order: { doneAt: 'DESC' },
    });

    const abandonedTodos = await this.todoRepository.find({
      where: { habitId, status: TodoStatus.ABANDONED },
      order: { abandonedAt: 'DESC' },
    });

    return {
      activeTodos,
      completedTodos,
      abandonedTodos,
      totalCount: activeTodos.length + completedTodos.length + abandonedTodos.length,
    };
  }

  /**
   * 获取习惯分析所需的基础数据（纯数据库查询）
   */
  async getHabitAnalyticsData(habitId: string): Promise<{
    totalTodos: number;
    completedTodos: number;
    abandonedTodos: number;
    recentTodos: Todo[];
  }> {
    const totalTodos = await this.todoRepository.count({ where: { habitId } });

    const completedTodos = await this.todoRepository.count({
      where: { habitId, status: TodoStatus.DONE },
    });

    const abandonedTodos = await this.todoRepository.count({
      where: { habitId, status: TodoStatus.ABANDONED },
    });

    const recentTodos = await this.todoRepository.find({
      where: { habitId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return { totalTodos, completedTodos, abandonedTodos, recentTodos };
  }

  // 构建查询条件的私有方法
  private buildQuery(filter: HabitFilterDto) {
    let query = this.habitRepository.createQueryBuilder('habit');

    // 软删除过滤（与 Goal 仓储保持一致）
    query = query.andWhere('habit.deletedAt IS NULL');

    // 目标过滤（当提供 goalId 时关联查询）
    if ((filter as any).goalId) {
      query = query.leftJoin('habit.goals', 'goal').andWhere('goal.id = :goalId', { goalId: (filter as any).goalId });
    }

    // 状态过滤
    if (filter.status && Array.isArray(filter.status) && filter.status.length > 0) {
      query = query.andWhere('habit.status IN (:...status)', {
        status: filter.status,
      });
    }

    // 难度过滤
    if (filter.difficulty && Array.isArray(filter.difficulty) && filter.difficulty.length > 0) {
      query = query.andWhere('habit.difficulty IN (:...difficulty)', {
        difficulty: filter.difficulty,
      });
    }

    // 重要程度（单值）
    if ((filter as any).importance !== undefined) {
      query = query.andWhere('habit.importance = :importance', {
        importance: (filter as any).importance,
      });
    }

    // 关键词搜索
    if (filter.keyword) {
      query = query.andWhere('(habit.name LIKE :keyword OR habit.description LIKE :keyword)', {
        keyword: `%${filter.keyword}%`,
      });
    }

    // 标签搜索
    if (filter.tags) {
      // 确保 tags 是数组
      const tagsArray = Array.isArray(filter.tags) ? filter.tags : [filter.tags];
      if (tagsArray.length > 0) {
        tagsArray.forEach((tag, index) => {
          query = query.andWhere(`habit.tags LIKE :tag${index}`, {
            [`tag${index}`]: `%${tag}%`,
          });
        });
      }
    }

    // 日期范围过滤
    if (filter.startDateStart) {
      query = query.andWhere('habit.startDate >= :startDateStart', {
        startDateStart: filter.startDateStart,
      });
    }
    if (filter.startDateEnd) {
      query = query.andWhere('habit.startDate <= :startDateEnd', {
        startDateEnd: filter.startDateEnd,
      });
    }
    if (filter.endDataStart) {
      query = query.andWhere('habit.targetDate >= :endDataStart', {
        endDataStart: filter.endDataStart,
      });
    }
    if (filter.endDataEnd) {
      query = query.andWhere('habit.targetDate <= :endDataEnd', {
        endDataEnd: filter.endDataEnd,
      });
    }

    return query.orderBy('habit.updatedAt', 'DESC');
  }
}
