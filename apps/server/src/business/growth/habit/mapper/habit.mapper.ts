import { Injectable } from '@nestjs/common';
import { Habit } from '../entities';
import { CreateHabitDto, UpdateHabitDto } from '../dto';
import * as HabitVo from '@life-toolkit/vo/growth/habit';

@Injectable()
export class HabitMapper {
  toEntity(dto: CreateHabitDto): Partial<Habit> {
    return {
      name: dto.name,
      description: dto.description,
      importance: dto.importance,
      tags: dto.tags || [],
      frequency: dto.frequency,
      customFrequency: dto.customFrequency,
      difficulty: dto.difficulty,
      startDate: dto.startDate,
      targetDate: dto.targetDate,
      needReminder: dto.needReminder,
      reminderTime: dto.reminderTime,
    };
  }

  toUpdateEntity(dto: UpdateHabitDto): Partial<Habit> {
    const result: Partial<Habit> = this.toEntity(dto);
    if (dto.status !== undefined) {
      result.status = dto.status;
    }
    if (dto.currentStreak !== undefined) {
      result.currentStreak = dto.currentStreak;
    }
    if (dto.longestStreak !== undefined) {
      result.longestStreak = dto.longestStreak;
    }
    if (dto.completedCount !== undefined) {
      result.completedCount = dto.completedCount;
    }
    return result;
  }

  toVo(entity: Habit): HabitVo.HabitVo {
    return {
      id: entity.id,
      name: entity.name,
      status: entity.status,
      description: entity.description,
      importance: entity.importance,
      tags: entity.tags,
      frequency: entity.frequency,
      customFrequency: entity.customFrequency,
      difficulty: entity.difficulty,
      startDate: entity.startDate,
      targetDate: entity.targetDate,
      currentStreak: entity.currentStreak,
      longestStreak: entity.longestStreak,
      needReminder: entity.needReminder,
      reminderTime: entity.reminderTime,
      completedCount: entity.completedCount,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  voToDtoFromVo(vo: HabitVo.CreateHabitVo): CreateHabitDto {
    const dto = new CreateHabitDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.importance = vo.importance;
    dto.tags = vo.tags;
    dto.frequency = vo.frequency as any;
    dto.customFrequency = vo.customFrequency;
    dto.difficulty = vo.difficulty as any;
    dto.startDate = vo.startDate;
    dto.targetDate = vo.targetDate;
    dto.needReminder = vo.needReminder;
    dto.reminderTime = vo.reminderTime;
    return dto;
  }

  voToUpdateDtoFromVo(vo: HabitVo.UpdateHabitVo): UpdateHabitDto {
    const dto = this.voToDtoFromVo(vo) as UpdateHabitDto;
    if (vo.status !== undefined) {
      dto.status = vo.status as any;
    }
    return dto;
  }
} 