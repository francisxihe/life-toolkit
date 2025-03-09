import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { HabitLog } from './entities';
import { CreateHabitLogDto, UpdateHabitLogDto } from './dto';
import { HabitLogMapper } from './mapper';
import { HabitService } from './habit.service';

@Injectable()
export class HabitLogService {
  constructor(
    @InjectRepository(HabitLog)
    private habitLogRepository: Repository<HabitLog>,
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
    } else {
      // 如果未完成，重置连续天数
      await this.habitService.updateStreak(createHabitLogDto.habitId, false);
    }
    
    return savedLog;
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