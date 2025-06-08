import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, In } from "typeorm";
import { Habit, HabitStatus, HabitFrequency } from "./entities";
import {
  CreateHabitDto,
  UpdateHabitDto,
  HabitFilterDto,
  HabitPageFilterDto,
} from "./dto";
import { HabitMapper } from "./mapper";
import { Goal } from "../goal/entities";
import { TodoRepeat } from "../todo/entities";
import { RepeatMode, RepeatEndMode } from "@life-toolkit/components-repeat/types";

@Injectable()
export class HabitService {
  constructor(
    @InjectRepository(Habit)
    private habitRepository: Repository<Habit>,
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
    @InjectRepository(TodoRepeat)
    private todoRepeatRepository: Repository<TodoRepeat>,
    private habitMapper: HabitMapper
  ) {}

  async create(createHabitDto: CreateHabitDto): Promise<Habit> {
    const habit = this.habitRepository.create(
      this.habitMapper.toEntity(createHabitDto)
    );

    // 处理目标关联
    if (createHabitDto.goalIds && createHabitDto.goalIds.length > 0) {
      const goals = await this.goalRepository.findBy({
        id: In(createHabitDto.goalIds),
      });
      habit.goals = goals;
    }

    const savedHabit = await this.habitRepository.save(habit);

    // 如果需要自动创建待办任务
    if (createHabitDto.autoCreateTodo !== false) {
      await this.createTodoRepeat(savedHabit);
    }

    return savedHabit;
  }

  /**
   * 为习惯创建重复待办任务
   */
  private async createTodoRepeat(habit: Habit): Promise<TodoRepeat | null> {
    // 根据习惯频率创建重复配置
    let repeatMode: RepeatMode;
    let repeatConfig: any = {};

    switch (habit.frequency) {
      case HabitFrequency.DAILY:
        repeatMode = RepeatMode.DAILY;
        repeatConfig = { interval: 1 };
        break;
      case HabitFrequency.WEEKLY:
        repeatMode = RepeatMode.WEEKLY;
        repeatConfig = { interval: 1, weekDays: [new Date().getDay()] };
        break;
      case HabitFrequency.MONTHLY:
        repeatMode = RepeatMode.MONTHLY;
        repeatConfig = { interval: 1, monthlyType: "date", date: new Date().getDate() };
        break;
      default:
        return null;
    }

    const todoRepeat = this.todoRepeatRepository.create({
      repeatMode,
      repeatConfig,
      repeatEndMode: habit.targetDate ? RepeatEndMode.TO_DATE : RepeatEndMode.FOREVER,
      repeatEndDate: habit.targetDate ? habit.targetDate.toISOString().split('T')[0] : undefined,
      habitId: habit.id,
    });

    return await this.todoRepeatRepository.save(todoRepeat);
  }

  async findAll(filter: HabitFilterDto = {}): Promise<Habit[]> {
    const whereConditions: any = {};

    if (filter.status && filter.status.length > 0) {
      whereConditions.status = In(filter.status);
    }

    if (filter.frequency && filter.frequency.length > 0) {
      whereConditions.frequency = In(filter.frequency);
    }

    if (filter.difficulty && filter.difficulty.length > 0) {
      whereConditions.difficulty = In(filter.difficulty);
    }

    let query = this.habitRepository.createQueryBuilder("habit");

    // 添加where条件
    for (const [key, value] of Object.entries(whereConditions)) {
      query = query.andWhere(`habit.${key} = :${key}`, { [key]: value });
    }

    // 关键词搜索
    if (filter.keyword) {
      query = query.andWhere(
        "(habit.name LIKE :keyword OR habit.description LIKE :keyword)",
        { keyword: `%${filter.keyword}%` }
      );
    }

    // 标签搜索
    if (filter.tags && filter.tags.length > 0) {
      filter.tags.forEach((tag, index) => {
        query = query.andWhere(`habit.tags LIKE :tag${index}`, {
          [`tag${index}`]: `%${tag}%`,
        });
      });
    }

    return await query.orderBy("habit.updatedAt", "DESC").getMany();
  }

  async findPage(filter: HabitPageFilterDto) {
    const { pageNum = 1, pageSize = 10, ...rest } = filter;
    const skip = (pageNum - 1) * pageSize;

    const whereConditions: any = {};

    if (filter.status && filter.status.length > 0) {
      whereConditions.status = In(filter.status);
    }

    if (filter.frequency && filter.frequency.length > 0) {
      whereConditions.frequency = In(filter.frequency);
    }

    if (filter.difficulty && filter.difficulty.length > 0) {
      whereConditions.difficulty = In(filter.difficulty);
    }

    let query = this.habitRepository.createQueryBuilder("habit");

    // 添加where条件
    for (const [key, value] of Object.entries(whereConditions)) {
      query = query.andWhere(`habit.${key} = :${key}`, { [key]: value });
    }

    // 关键词搜索
    if (filter.keyword) {
      query = query.andWhere(
        "(habit.name LIKE :keyword OR habit.description LIKE :keyword)",
        { keyword: `%${filter.keyword}%` }
      );
    }

    // 标签搜索
    if (filter.tags && filter.tags.length > 0) {
      filter.tags.forEach((tag, index) => {
        query = query.andWhere(`habit.tags LIKE :tag${index}`, {
          [`tag${index}`]: `%${tag}%`,
        });
      });
    }

    const [list, total] = await query
      .orderBy("habit.updatedAt", "DESC")
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      pageNum,
      pageSize,
    };
  }

  async findOne(id: string): Promise<Habit> {
    const habit = await this.habitRepository.findOne({ where: { id } });
    if (!habit) {
      throw new NotFoundException(`习惯记录不存在，ID: ${id}`);
    }
    return habit;
  }

  async update(id: string, updateHabitDto: UpdateHabitDto): Promise<Habit> {
    const habit = await this.findOne(id);
    
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

    const updatedHabit = Object.assign(
      habit,
      this.habitMapper.toUpdateEntity(updateHabitDto)
    );
    return await this.habitRepository.save(updatedHabit);
  }

  async remove(id: string): Promise<boolean> {
    const habit = await this.findOne(id);
    const result = await this.habitRepository.remove(habit);
    return !!result;
  }

  async batchComplete(ids: string[]) {
    const result = await this.habitRepository.update(
      { id: In(ids) },
      { status: HabitStatus.COMPLETED }
    );
    return {
      result: true,
    };
  }

  async restore(id: string): Promise<boolean> {
    const habit = await this.findOne(id);
    if (
      habit.status !== HabitStatus.ABANDONED &&
      habit.status !== HabitStatus.COMPLETED
    ) {
      return true; // 已经是活跃状态，无需恢复
    }

    habit.status = HabitStatus.ACTIVE;
    await this.habitRepository.save(habit);
    return true;
  }

  async abandon(id: string): Promise<boolean> {
    const habit = await this.findOne(id);
    habit.status = HabitStatus.ABANDONED;
    await this.habitRepository.save(habit);
    return true;
  }

  async pause(id: string): Promise<boolean> {
    const habit = await this.findOne(id);
    habit.status = HabitStatus.PAUSED;
    await this.habitRepository.save(habit);
    return true;
  }

  async resume(id: string): Promise<boolean> {
    const habit = await this.findOne(id);
    habit.status = HabitStatus.ACTIVE;
    await this.habitRepository.save(habit);
    return true;
  }

  // 更新习惯的连续天数和完成次数
  async updateStreak(id: string, increment: boolean): Promise<Habit> {
    const habit = await this.findOne(id);

    if (increment) {
      habit.currentStreak += 1;
      habit.completedCount += 1;

      // 更新最长连续天数
      if (habit.currentStreak > habit.longestStreak) {
        habit.longestStreak = habit.currentStreak;
      }
    } else {
      // 重置当前连续天数
      habit.currentStreak = 0;
    }

    return await this.habitRepository.save(habit);
  }

  /**
   * 获取习惯详情，包含关联的目标和待办重复任务
   */
  async findOneWithRelations(id: string): Promise<Habit> {
    const habit = await this.habitRepository.findOne({
      where: { id },
      relations: ["goals", "todoRepeats"],
    });
    if (!habit) {
      throw new NotFoundException(`习惯记录不存在，ID: ${id}`);
    }
    return habit;
  }

  /**
   * 根据目标ID获取相关习惯
   */
  async findByGoalId(goalId: string): Promise<Habit[]> {
    return await this.habitRepository
      .createQueryBuilder("habit")
      .innerJoin("habit.goals", "goal")
      .where("goal.id = :goalId", { goalId })
      .getMany();
  }
}
