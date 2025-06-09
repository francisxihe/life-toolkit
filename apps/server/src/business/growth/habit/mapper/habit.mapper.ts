import type { Habit as HabitVO } from "@life-toolkit/vo";
import { CreateHabitDto, UpdateHabitDto, HabitDto, HabitModelDto } from "../dto";
import { HabitStatus, Habit } from "../entities";
import { BaseMapper } from "@/base/base.mapper";
import dayjs from "dayjs";

export class HabitMapper {
  // Entity 转 DTO
  static entityToDto(entity: Habit): HabitDto {
    const dto = new HabitDto();
    Object.assign(dto, BaseMapper.entityToDto(entity));
    dto.name = entity.name;
    dto.status = entity.status;
    dto.description = entity.description;
    dto.importance = entity.importance;
    dto.tags = entity.tags;
    dto.difficulty = entity.difficulty;
    dto.startDate = entity.startDate;
    dto.targetDate = entity.targetDate;
    dto.currentStreak = entity.currentStreak;
    dto.longestStreak = entity.longestStreak;
    dto.completedCount = entity.completedCount;
    dto.goals = entity.goals;
    dto.todos = entity.todos;
    return dto;
  }

  // DTO 转 VO
  static dtoToVo(dto: HabitDto): HabitVO.HabitVo {
    const vo: HabitVO.HabitVo = {
      ...BaseMapper.dtoToVo(dto),
      name: dto.name || "",
      status: dto.status || HabitStatus.ACTIVE,
      description: dto.description,
      importance: dto.importance ?? 3,
      tags: dto.tags || [],
      difficulty: dto.difficulty,
      startAt: dto.startDate
        ? dayjs(dto.startDate).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
      targetAt: dto.targetDate
        ? dayjs(dto.targetDate).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
      currentStreak: dto.currentStreak,
      longestStreak: dto.longestStreak,
      completedCount: dto.completedCount,
      goals: [], // TODO: 需要实现 Goal 到 GoalVo 的转换
      recentLogs: [],
      statistics: {
        totalDays: 0,
        completedDays: dto.completedCount || 0,
        completionRate: 0,
        averageScore: 0,
        weeklyCompletionRate: 0,
        monthlyCompletionRate: 0,
        bestStreak: dto.longestStreak || 0,
        currentStreakDays: dto.currentStreak || 0,
      },
    };
    return vo;
  }

  // VO 转创建 DTO
  static voToCreateDto(vo: HabitVO.CreateHabitVo): CreateHabitDto {
    const dto = new CreateHabitDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.importance = vo.importance;
    dto.tags = vo.tags || [];
    dto.difficulty = vo.difficulty as any;
    if (vo.startAt) {
      dto.startDate = dayjs(vo.startAt).toDate();
    }
    if (vo.targetAt) {
      dto.targetDate = dayjs(vo.targetAt).toDate();
    }
    dto.goalIds = vo.goalIds;
    return dto;
  }

  // VO 转更新 DTO
  static voToUpdateDto(vo: HabitVO.UpdateHabitVo): UpdateHabitDto {
    const dto = new UpdateHabitDto();
    if (vo.name !== undefined) {
      dto.name = vo.name;
    }
    if (vo.description !== undefined) {
      dto.description = vo.description;
    }
    if (vo.importance !== undefined) {
      dto.importance = vo.importance;
    }
    if (vo.tags !== undefined) {
      dto.tags = vo.tags || [];
    }
    if (vo.difficulty !== undefined) {
      dto.difficulty = vo.difficulty as any;
    }
    if (vo.startAt !== undefined) {
      dto.startDate = vo.startAt ? dayjs(vo.startAt).toDate() : undefined;
    }
    if (vo.targetAt !== undefined) {
      dto.targetDate = vo.targetAt ? dayjs(vo.targetAt).toDate() : undefined;
    }
    if (vo.status !== undefined) {
      dto.status = vo.status as any;
    }
    if (vo.goalIds !== undefined) {
      dto.goalIds = vo.goalIds;
    }
    return dto;
  }

  // DTO 列表转 VO 列表
  static dtoToListVo(dtos: HabitDto[]): HabitVO.HabitListVo {
    return {
      list: dtos.map(dto => this.dtoToItemVo(dto)),
    };
  }

  // DTO 分页转 VO 分页
  static dtoToPageVo(
    dtos: HabitDto[],
    total: number,
    pageNum: number,
    pageSize: number
  ): HabitVO.HabitPageVo {
    return {
      list: dtos.map(dto => this.dtoToItemVo(dto)),
      total,
      pageNum,
      pageSize,
    };
  }

  // DTO 转 ItemVO（用于列表显示）
  static dtoToItemVo(dto: HabitDto): HabitVO.HabitItemVo {
    const vo: HabitVO.HabitItemVo = {
      ...BaseMapper.dtoToVo(dto),
      name: dto.name || "",
      status: dto.status || HabitStatus.ACTIVE,
      description: dto.description,
      importance: dto.importance ?? 3,
      tags: dto.tags || [],
      difficulty: dto.difficulty,
      startAt: dto.startDate
        ? dayjs(dto.startDate).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
      targetAt: dto.targetDate
        ? dayjs(dto.targetDate).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
      currentStreak: dto.currentStreak,
      longestStreak: dto.longestStreak,
      completedCount: dto.completedCount,
    };
    return vo;
  }
}
