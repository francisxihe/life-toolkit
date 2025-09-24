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
  'repeatStartDate',
  'repeatEndDate',
  'repeatTimes',
  'repeatMode',
  'repeatConfig',
  'repeatEndMode',
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
    this.repeatStartDate = dayjs(vo.repeatStartDate).format('YYYY-MM-DD');
    this.repeatEndDate = dayjs(vo.repeatEndDate).format('YYYY-MM-DD');
    this.repeatTimes = vo.repeatTimes;
    this.repeatMode = vo.repeatMode;
    this.repeatConfig = vo.repeatConfig;
    this.repeatEndMode = vo.repeatEndMode;
    this.goalIds = vo.goalIds;
  }

  exportCreateEntity() {
    const entity = new Habit();

    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.difficulty !== undefined) entity.difficulty = this.difficulty;
    if (this.repeatStartDate !== undefined) entity.repeatStartDate = this.repeatStartDate;
    if (this.repeatEndDate !== undefined) entity.repeatEndDate = this.repeatEndDate;
    if (this.repeatTimes !== undefined) entity.repeatTimes = this.repeatTimes;
    if (this.repeatMode !== undefined) entity.repeatMode = this.repeatMode;
    if (this.repeatConfig !== undefined) entity.repeatConfig = this.repeatConfig;
    if (this.repeatEndMode !== undefined) entity.repeatEndMode = this.repeatEndMode;

    return entity;
  }
}

export class UpdateHabitDto extends IntersectionType(
  PartialType(CreateHabitDto),
  PickType(Habit, ['id'] as const),
  PickType(HabitDto, [
    'status',
    'repeatStartDate',
    'repeatEndDate',
    'repeatTimes',
    'repeatMode',
    'repeatConfig',
    'repeatEndMode',
  ] as const)
) {
  importUpdateVo(vo: HabitVO.UpdateHabitVo) {
    if (vo.name !== undefined) this.name = vo.name;
    if (vo.description !== undefined) this.description = vo.description;
    if (vo.importance !== undefined) this.importance = vo.importance;
    if (vo.tags !== undefined) this.tags = vo.tags || [];
    if (vo.difficulty !== undefined) this.difficulty = vo.difficulty as any;
    if (vo.repeatStartDate !== undefined) {
      this.repeatStartDate = dayjs(vo.repeatStartDate).format('YYYY-MM-DD');
    }
    if (vo.repeatEndDate !== undefined) {
      this.repeatEndDate = dayjs(vo.repeatEndDate).format('YYYY-MM-DD');
    }
    if (vo.repeatTimes !== undefined) this.repeatTimes = vo.repeatTimes;
    if (vo.repeatMode !== undefined) this.repeatMode = vo.repeatMode;
    if (vo.repeatConfig !== undefined) this.repeatConfig = vo.repeatConfig;
    if (vo.repeatEndMode !== undefined) this.repeatEndMode = vo.repeatEndMode;
  }

  exportUpdateEntity() {
    const entity = new Habit();

    if (!entity.id) entity.id = this.id;
    else if (entity.id !== this.id) throw new Error('ID不匹配');
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.difficulty !== undefined) entity.difficulty = this.difficulty;
    if (this.repeatStartDate !== undefined) entity.repeatStartDate = this.repeatStartDate;
    if (this.repeatEndDate !== undefined) entity.repeatEndDate = this.repeatEndDate;
    if (this.repeatTimes !== undefined) entity.repeatTimes = this.repeatTimes;
    if (this.repeatMode !== undefined) entity.repeatMode = this.repeatMode;
    if (this.repeatConfig !== undefined) entity.repeatConfig = this.repeatConfig;
    if (this.repeatEndMode !== undefined) entity.repeatEndMode = this.repeatEndMode;
    if (this.status !== undefined) entity.status = this.status;

    return entity;
  }
}
