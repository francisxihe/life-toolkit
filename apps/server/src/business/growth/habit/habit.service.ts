import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Habit, HabitStatus } from './entities';
import { CreateHabitDto, UpdateHabitDto, HabitFilterDto, HabitPageFilterDto } from './dto';
import { HabitMapper } from './mapper';
import { PaginationResult } from '@/common/pagination';

@Injectable()
export class HabitService {
  constructor(
    @InjectRepository(Habit)
    private habitRepository: Repository<Habit>,
    private habitMapper: HabitMapper,
  ) {}

  async create(createHabitDto: CreateHabitDto): Promise<Habit> {
    const habit = this.habitRepository.create(this.habitMapper.toEntity(createHabitDto));
    return await this.habitRepository.save(habit);
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
    
    let query = this.habitRepository.createQueryBuilder('habit');
    
    // 添加where条件
    for (const [key, value] of Object.entries(whereConditions)) {
      query = query.andWhere(`habit.${key} = :${key}`, { [key]: value });
    }
    
    // 关键词搜索
    if (filter.keyword) {
      query = query.andWhere('(habit.name LIKE :keyword OR habit.description LIKE :keyword)', 
        { keyword: `%${filter.keyword}%` });
    }
    
    // 标签搜索
    if (filter.tags && filter.tags.length > 0) {
      filter.tags.forEach((tag, index) => {
        query = query.andWhere(`habit.tags LIKE :tag${index}`, { [`tag${index}`]: `%${tag}%` });
      });
    }
    
    return await query.orderBy('habit.updatedAt', 'DESC').getMany();
  }

  async findPage(filter: HabitPageFilterDto): Promise<PaginationResult<Habit>> {
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
    
    let query = this.habitRepository.createQueryBuilder('habit');
    
    // 添加where条件
    for (const [key, value] of Object.entries(whereConditions)) {
      query = query.andWhere(`habit.${key} = :${key}`, { [key]: value });
    }
    
    // 关键词搜索
    if (filter.keyword) {
      query = query.andWhere('(habit.name LIKE :keyword OR habit.description LIKE :keyword)', 
        { keyword: `%${filter.keyword}%` });
    }
    
    // 标签搜索
    if (filter.tags && filter.tags.length > 0) {
      filter.tags.forEach((tag, index) => {
        query = query.andWhere(`habit.tags LIKE :tag${index}`, { [`tag${index}`]: `%${tag}%` });
      });
    }
    
    const [list, total] = await query
      .orderBy('habit.updatedAt', 'DESC')
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
    const updatedHabit = Object.assign(habit, this.habitMapper.toUpdateEntity(updateHabitDto));
    return await this.habitRepository.save(updatedHabit);
  }

  async remove(id: string): Promise<boolean> {
    const habit = await this.findOne(id);
    const result = await this.habitRepository.remove(habit);
    return !!result;
  }

  async batchComplete(ids: string[]): Promise<boolean> {
    const result = await this.habitRepository.update(
      { id: In(ids) },
      { status: HabitStatus.COMPLETED }
    );
    return result.affected > 0;
  }

  async restore(id: string): Promise<boolean> {
    const habit = await this.findOne(id);
    if (habit.status !== HabitStatus.ABANDONED && habit.status !== HabitStatus.COMPLETED) {
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
} 