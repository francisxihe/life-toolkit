import { Goal } from '../goal.entity';
import { PartialType, PickType, IntersectionType } from '@life-toolkit/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { GoalDto } from './goal-model.dto';
import type { Goal as GoalVO } from '@life-toolkit/vo';
import dayjs from 'dayjs';

// 创建DTO - 选择需要的字段
export class CreateGoalDto extends PickType(GoalDto, [
  'name',
  'type',
  'startAt',
  'endAt',
  'description',
  'importance',
  'difficulty',
  'status',
] as const) {
  /** 父目标ID */
  @IsString()
  @IsOptional()
  parentId?: string;

  // VO → DTO
  importCreateVo(vo: GoalVO.CreateGoalVo) {
    this.name = vo.name;
    this.description = vo.description;
    this.type = vo.type;
    this.importance = vo.importance;
    this.difficulty = vo.difficulty;
    this.parentId = vo.parentId;

    // 日期字段转换 (string → Date)
    this.startAt = vo.startAt ? dayjs(vo.startAt).toDate() : undefined;
    this.endAt = vo.endAt ? dayjs(vo.endAt).toDate() : undefined;
  }

  appendToCreateEntity(entity: Goal) {
    if (this.name !== undefined) entity.name = this.name;
    if (this.type !== undefined) entity.type = this.type;
    if (this.startAt !== undefined) entity.startAt = this.startAt;
    if (this.endAt !== undefined) entity.endAt = this.endAt;
    if (this.description !== undefined) entity.description = this.description;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.difficulty !== undefined) entity.difficulty = this.difficulty;
    if (this.status !== undefined) entity.status = this.status;
  }
}

// 更新DTO - 基于创建DTO的部分字段 + 实体ID + 状态字段
export class UpdateGoalDto extends IntersectionType(
  PartialType(CreateGoalDto),
  PickType(Goal, ['id'] as const),
  PickType(GoalDto, ['doneAt', 'abandonedAt'] as const)
) {
  // VO → DTO
  importUpdateVo(vo: GoalVO.UpdateGoalVo) {
    // 只更新提供的字段
    if (vo.name !== undefined) this.name = vo.name;
    if (vo.description !== undefined) this.description = vo.description;
    if (vo.type !== undefined) this.type = vo.type;
    if (vo.importance !== undefined) this.importance = vo.importance;
    if (vo.difficulty !== undefined) this.difficulty = vo.difficulty;
    if (vo.parentId !== undefined) this.parentId = vo.parentId;

    // 日期字段转换 (string → Date)
    if (vo.startAt !== undefined) {
      this.startAt = vo.startAt ? dayjs(vo.startAt).toDate() : undefined;
    }
    if (vo.endAt !== undefined) {
      this.endAt = vo.endAt ? dayjs(vo.endAt).toDate() : undefined;
    }
  }

  /** 修改UpdateEntity */
  appendToUpdateEntity(entity: Goal) {
    if (!entity.id) entity.id = this.id;
    else if (entity.id !== this.id) throw new Error('ID不匹配');
    if (this.name !== undefined) entity.name = this.name;
    if (this.type !== undefined) entity.type = this.type;
    if (this.startAt !== undefined) entity.startAt = this.startAt;
    if (this.endAt !== undefined) entity.endAt = this.endAt;
    if (this.description !== undefined) entity.description = this.description;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.difficulty !== undefined) entity.difficulty = this.difficulty;
    if (this.status !== undefined) entity.status = this.status;
    if (this.doneAt !== undefined) entity.doneAt = this.doneAt;
    if (this.abandonedAt !== undefined) entity.abandonedAt = this.abandonedAt;
  }

  /** 导出更新UpdateEntity */
  exportUpdateEntity() {
    const goal = new Goal();
    goal.id = this.id;
    if (this.name !== undefined) goal.name = this.name;
    if (this.type !== undefined) goal.type = this.type;
    if (this.startAt !== undefined) goal.startAt = this.startAt;
    if (this.endAt !== undefined) goal.endAt = this.endAt;
    if (this.description !== undefined) goal.description = this.description;
    if (this.importance !== undefined) goal.importance = this.importance;
    if (this.difficulty !== undefined) goal.difficulty = this.difficulty;
    if (this.status !== undefined) goal.status = this.status;
    if (this.doneAt !== undefined) goal.doneAt = this.doneAt;
    if (this.abandonedAt !== undefined) goal.abandonedAt = this.abandonedAt;
    return goal;
  }
}
