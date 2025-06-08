import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { HabitLog } from './entities';
import { CreateHabitLogDto, UpdateHabitLogDto } from './dto';
import { HabitLogMapper } from './mapper';
import { HabitService } from './habit.service';
import { TodoRepeat, Todo, TodoStatus, TodoSource } from '../todo/entities';

@Injectable()
export class HabitLogService {
  constructor(
    @InjectRepository(HabitLog)
    private habitLogRepository: Repository<HabitLog>,
    @InjectRepository(TodoRepeat)
    private todoRepeatRepository: Repository<TodoRepeat>,
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
    private habitLogMapper: HabitLogMapper,
    private habitService: HabitService
  ) {}

  async create(createHabitLogDto: CreateHabitLogDto): Promise<HabitLog> {
    // 先检查该日期是否已有记录
    const existingLog = await this.habitLogRepository.findOne({
      where: {
        habitId: createHabitLogDto.habitId,
        logDate: createHabitLogDto.logDate
      }
    });

    // 如果已存在记录，则更新而不是创建
    if (existingLog) {
      return this.update(existingLog.id, {
        completionScore: createHabitLogDto.completionScore,
        note: createHabitLogDto.note,
        mood: createHabitLogDto.mood
      });
    }

    // 创建新记录
    const habitLog = this.habitLogRepository.create(
      this.habitLogMapper.toEntity(createHabitLogDto)
    );
    const savedLog = await this.habitLogRepository.save(habitLog);

    // 根据完成情况更新习惯的连续天数
    if (
      createHabitLogDto.completionScore !== undefined &&
      createHabitLogDto.completionScore > 0
    ) {
      // 如果完成了（部分或全部），增加连续天数
      await this.habitService.updateStreak(createHabitLogDto.habitId, true);
      
      // 自动创建下一个待办任务
      await this.createNextTodoForHabit(createHabitLogDto.habitId);
    } else {
      // 如果未完成，重置连续天数
      await this.habitService.updateStreak(createHabitLogDto.habitId, false);
    }
    
    return savedLog;
  }

  /**
   * 为习惯创建下一个待办任务
   */
  private async createNextTodoForHabit(habitId: string): Promise<void> {
    try {
      // 获取习惯信息
      const habit = await this.habitService.findOneWithRelations(habitId);
      
      // 检查是否有关联的重复待办任务
      if (!habit.todoRepeats || habit.todoRepeats.length === 0) {
        return;
      }

      // 为每个重复配置创建待办任务
      for (const todoRepeat of habit.todoRepeats) {
        await this.createTodoFromRepeat(habit, todoRepeat);
      }
    } catch (error) {
      console.error('创建习惯待办任务失败:', error);
    }
  }

  /**
   * 根据重复配置创建待办任务
   */
  private async createTodoFromRepeat(habit: any, todoRepeat: TodoRepeat): Promise<void> {
    // 计算下一个待办日期
    const nextDate = this.calculateNextDate(new Date(), todoRepeat);
    if (!nextDate) {
      return;
    }

    // 检查是否已经存在该日期的待办
    const existingTodo = await this.todoRepository.findOne({
      where: {
        repeatId: todoRepeat.id,
        planDate: Between(
          new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate()),
          new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate(), 23, 59, 59)
        ),
      },
    });

    if (existingTodo) {
      return;
    }

    // 创建新的待办任务
    const newTodo = this.todoRepository.create({
      name: habit.name,
      description: `习惯：${habit.description || habit.name}`,
      tags: habit.tags || [],
      importance: habit.importance,
      urgency: 3, // 默认紧急程度
      planDate: nextDate,
      status: TodoStatus.TODO,
      repeatId: todoRepeat.id,
      source: TodoSource.REPEAT,
    });

    await this.todoRepository.save(newTodo);
  }

  /**
   * 简单的日期计算逻辑（可以后续优化）
   */
  private calculateNextDate(currentDate: Date, todoRepeat: TodoRepeat): Date | null {
    const nextDate = new Date(currentDate);
    
    switch (todoRepeat.repeatMode) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      default:
        return null;
    }

    return nextDate;
  }

  async findAll(habitId: string): Promise<HabitLog[]> {
    return await this.habitLogRepository.find({
      where: { habitId },
      order: { logDate: 'DESC' }
    });
  }

  async findByDateRange(habitId: string, startDate: Date, endDate: Date): Promise<HabitLog[]> {
    return await this.habitLogRepository.find({
      where: {
        habitId,
        logDate: Between(startDate, endDate)
      },
      order: { logDate: 'ASC' }
    });
  }

  async findOne(id: string): Promise<HabitLog> {
    const habitLog = await this.habitLogRepository.findOne({ where: { id } });
    if (!habitLog) {
      throw new NotFoundException(`习惯日志记录不存在，ID: ${id}`);
    }
    return habitLog;
  }

  async findByDate(habitId: string, date: Date): Promise<HabitLog> {
    const habitLog = await this.habitLogRepository.findOne({
      where: {
        habitId,
        logDate: date
      }
    });
    
    if (!habitLog) {
      throw new NotFoundException(`该日期的习惯日志记录不存在`);
    }
    
    return habitLog;
  }

  async update(id: string, updateHabitLogDto: UpdateHabitLogDto): Promise<HabitLog> {
    const habitLog = await this.findOne(id);
    const updatedHabitLog = Object.assign(
      habitLog,
      this.habitLogMapper.toUpdateEntity(updateHabitLogDto)
    );
    
    const savedLog = await this.habitLogRepository.save(updatedHabitLog);
    
    // 如果更新了完成情况，则更新习惯的连续天数
    if (updateHabitLogDto.completionScore !== undefined) {
      if (updateHabitLogDto.completionScore > 0) {
        // 如果完成了（部分或全部），增加连续天数
        await this.habitService.updateStreak(habitLog.habitId, true);
        
        // 自动创建下一个待办任务
        await this.createNextTodoForHabit(habitLog.habitId);
      } else {
        // 如果未完成，重置连续天数
        await this.habitService.updateStreak(habitLog.habitId, false);
      }
    }
    
    return savedLog;
  }

  async remove(id: string): Promise<boolean> {
    const habitLog = await this.findOne(id);
    const result = await this.habitLogRepository.remove(habitLog);
    return !!result;
  }
} 