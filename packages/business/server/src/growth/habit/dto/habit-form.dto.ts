import { PartialType, IntersectionType, PickType } from 'francis-mapped-types';
import { IsOptional, IsArray, IsString } from 'class-validator';
import { HabitDto } from './habit-model.dto';
import { Habit } from '../habit.entity';
import type { Habit as HabitVO } from '@life-toolkit/vo';
import dayjs from 'dayjs';

export class CreateHabitDto extends PickType(HabitDto, [
  'name',
  'description',
  'importance',
  'tags',
  'difficulty',
  'startDate',
  'targetDate',
] as const) {
  /** 目标ID列表 */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  goalIds?: string[];

  importCreateVo(vo: HabitVO.CreateHabitVo) {
    this.name = vo.name;
    this.description = vo.description;
    this.importance = vo.importance;
    this.tags = vo.tags || [];
    this.difficulty = vo.difficulty as any;
    if (vo.startDate) {
      this.startDate = dayjs(vo.startDate).toDate();
    }
    if (vo.targetDate) {
      this.targetDate = dayjs(vo.targetDate).toDate();
    }
    this.goalIds = vo.goalIds;
  }

  appendToCreateEntity(entity: Habit) {
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.difficulty !== undefined) entity.difficulty = this.difficulty;
    if (this.startDate !== undefined) entity.startDate = this.startDate;
    if (this.targetDate !== undefined) entity.targetDate = this.targetDate;
  }
}

export class UpdateHabitDto extends IntersectionType(
  PartialType(CreateHabitDto),
  PickType(Habit, ['id'] as const),
  PickType(HabitDto, ['status', 'currentStreak', 'longestStreak', 'completedCount'] as const)
) {
  importUpdateVo(vo: HabitVO.UpdateHabitVo) {
    if (vo.name !== undefined) this.name = vo.name;
    if (vo.description !== undefined) this.description = vo.description;
    if (vo.importance !== undefined) this.importance = vo.importance;
    if (vo.tags !== undefined) this.tags = vo.tags || [];
    if (vo.difficulty !== undefined) this.difficulty = vo.difficulty as any;
    if (vo.startDate !== undefined) {
      this.startDate = vo.startDate ? dayjs(vo.startDate).toDate() : undefined;
    }
    if (vo.targetDate !== undefined) {
      this.targetDate = vo.targetDate ? dayjs(vo.targetDate).toDate() : undefined;
    }
  }

  appendToUpdateEntity(entity: Habit) {
    if (!entity.id) entity.id = this.id;
    else if (entity.id !== this.id) throw new Error('ID不匹配');
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.difficulty !== undefined) entity.difficulty = this.difficulty;
    if (this.startDate !== undefined) entity.startDate = this.startDate;
    if (this.targetDate !== undefined) entity.targetDate = this.targetDate;
    if (this.status !== undefined) entity.status = this.status;
    if (this.currentStreak !== undefined) entity.currentStreak = this.currentStreak;
    if (this.longestStreak !== undefined) entity.longestStreak = this.longestStreak;
    if (this.completedCount !== undefined) entity.completedCount = this.completedCount;
  }
}
