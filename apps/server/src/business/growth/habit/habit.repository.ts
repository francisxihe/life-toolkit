import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Habit, HabitStatus } from "./entities";
import {
  CreateHabitDto,
  UpdateHabitDto,
  HabitFilterDto,
  HabitPageFilterDto,
  HabitDto,
} from "./dto";
import { Goal } from "../goal/entities";
import { HabitMapper } from "./mapper";

@Injectable()
export class HabitRepository {
  constructor(
    @InjectRepository(Habit)
    private readonly habitRepository: Repository<Habit>,
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
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
    return HabitMapper.entityToDto(savedHabit);
  }

  async findById(id: string, relations?: string[]): Promise<HabitDto> {
    const habit = await this.habitRepository.findOne({ 
      where: { id },
      relations,
    });
    if (!habit) {
      throw new NotFoundException(`习惯记录不存在，ID: ${id}`);
    }
    return HabitMapper.entityToDto(habit);
  }

  async findAll(filter: HabitFilterDto): Promise<HabitDto[]> {
    const query = this.buildQuery(filter);
    const habits = await query.getMany();
    return habits.map(habit => HabitMapper.entityToDto(habit));
  }

  async page(
    filter: HabitPageFilterDto
  ): Promise<{ list: HabitDto[]; total: number }> {
    const { pageNum = 1, pageSize = 10 } = filter;
    const skip = (pageNum - 1) * pageSize;
    
    const query = this.buildQuery(filter);
    const [habits, total] = await query
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list: habits.map(habit => HabitMapper.entityToDto(habit)),
      total,
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
    return HabitMapper.entityToDto(savedHabit);
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

  async batchUpdate(ids: string[], updateData: Partial<Habit>): Promise<void> {
    await this.habitRepository.update(
      { id: In(ids) },
      updateData
    );
  }

  async updateStatus(id: string, status: HabitStatus, additionalData?: Partial<Habit>): Promise<void> {
    const updateData = { status, ...additionalData };
    await this.habitRepository.update({ id }, updateData);
  }

  async findByGoalId(goalId: string): Promise<HabitDto[]> {
    const habits = await this.habitRepository
      .createQueryBuilder("habit")
      .leftJoinAndSelect("habit.goals", "goal")
      .where("goal.id = :goalId", { goalId })
      .getMany();

    return habits.map(habit => HabitMapper.entityToDto(habit));
  }

  async updateStreak(id: string, increment: boolean): Promise<HabitDto> {
    const habit = await this.habitRepository.findOne({ where: { id } });
    if (!habit) {
      throw new NotFoundException(`习惯记录不存在，ID: ${id}`);
    }

    if (increment) {
      habit.currentStreak += 1;
      habit.completedCount += 1;

      // 更新最长连续天数
      if (habit.currentStreak > habit.longestStreak) {
        habit.longestStreak = habit.currentStreak;
      }
    } else {
      habit.currentStreak = 0;
    }

    const savedHabit = await this.habitRepository.save(habit);
    return HabitMapper.entityToDto(savedHabit);
  }

  // 构建查询条件的私有方法
  private buildQuery(filter: HabitFilterDto) {
    let query = this.habitRepository.createQueryBuilder("habit");

    // 状态过滤
    if (filter.status && Array.isArray(filter.status) && filter.status.length > 0) {
      query = query.andWhere("habit.status IN (:...status)", { status: filter.status });
    }

    // 难度过滤
    if (filter.difficulty && Array.isArray(filter.difficulty) && filter.difficulty.length > 0) {
      query = query.andWhere("habit.difficulty IN (:...difficulty)", { difficulty: filter.difficulty });
    }

    // 关键词搜索
    if (filter.keyword) {
      query = query.andWhere(
        "(habit.name LIKE :keyword OR habit.description LIKE :keyword)",
        { keyword: `%${filter.keyword}%` }
      );
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
      query = query.andWhere("habit.startDate >= :startDateStart", { startDateStart: filter.startDateStart });
    }
    if (filter.startDateEnd) {
      query = query.andWhere("habit.startDate <= :startDateEnd", { startDateEnd: filter.startDateEnd });
    }
    if (filter.targetDateStart) {
      query = query.andWhere("habit.targetDate >= :targetDateStart", { targetDateStart: filter.targetDateStart });
    }
    if (filter.targetDateEnd) {
      query = query.andWhere("habit.targetDate <= :targetDateEnd", { targetDateEnd: filter.targetDateEnd });
    }

    return query.orderBy("habit.updatedAt", "DESC");
  }
} 