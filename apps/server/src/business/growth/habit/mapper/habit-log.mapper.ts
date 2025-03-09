import { Injectable } from '@nestjs/common';
import { HabitLog } from '../entities';
import { CreateHabitLogDto, UpdateHabitLogDto } from '../dto';
import * as HabitVo from '@life-toolkit/vo/growth/habit';

@Injectable()
export class HabitLogMapper {
  toEntity(dto: CreateHabitLogDto): Partial<HabitLog> {
    return {
      habitId: dto.habitId,
      logDate: dto.logDate,
      completionScore: dto.completionScore,
      note: dto.note,
      mood: dto.mood,
    };
  }

  toUpdateEntity(dto: UpdateHabitLogDto): Partial<HabitLog> {
    return {
      completionScore: dto.completionScore,
      note: dto.note,
      mood: dto.mood,
    };
  }

  toVo(entity: HabitLog): HabitVo.HabitLogVo {
    return {
      id: entity.id,
      habitId: entity.habitId,
      logDate: entity.logDate,
      completionScore: entity.completionScore,
      note: entity.note,
      mood: entity.mood,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  voToDtoFromVo(vo: HabitVo.CreateHabitLogVo): CreateHabitLogDto {
    const dto = new CreateHabitLogDto();
    dto.habitId = vo.habitId;
    dto.logDate = vo.logDate;
    dto.completionScore = vo.completionScore;
    dto.note = vo.note;
    dto.mood = vo.mood;
    return dto;
  }

  voToUpdateDtoFromVo(vo: HabitVo.UpdateHabitLogVo): UpdateHabitLogDto {
    const dto = new UpdateHabitLogDto();
    dto.completionScore = vo.completionScore;
    dto.note = vo.note;
    dto.mood = vo.mood;
    return dto;
  }
} 