import { Task } from '../task.entity';
import { TaskDto } from './task-model.dto';
import { IntersectionType, PartialType, PickType, OmitType } from 'francis-mapped-types';
import { IsOptional, IsArray, IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '@life-toolkit/enum';
import type { Task as TaskVO } from '@life-toolkit/vo';

export class CreateTaskDto extends PickType(TaskDto, [
  'name',
  'description',
  'tags',
  'estimateTime',
  'importance',
  'urgency',
  'goalId',
  'startAt',
  'endAt',
  'parentId',
] as const) {
  /** 跟踪时间ID列表 */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  trackTimeIds?: string[];

  // VO → DTO
  importCreateVo(vo: TaskVO.CreateTaskVo) {
    if (vo.name !== undefined) this.name = vo.name;
    if (vo.description !== undefined) this.description = vo.description;
    if (vo.tags !== undefined) this.tags = vo.tags;
    if (vo.estimateTime !== undefined) this.estimateTime = vo.estimateTime;
    if (vo.importance !== undefined) this.importance = vo.importance;
    if (vo.urgency !== undefined) this.urgency = vo.urgency;
    if (vo.goalId !== undefined) this.goalId = vo.goalId;
    if (vo.startAt !== undefined) this.startAt = new Date(vo.startAt);
    if (vo.endAt !== undefined) this.endAt = new Date(vo.endAt);
    if (vo.parentId !== undefined) this.parentId = vo.parentId;
  }

  appendToCreateEntity(entity: Task) {
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.estimateTime !== undefined) entity.estimateTime = this.estimateTime;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.urgency !== undefined) entity.urgency = this.urgency;
    if (this.goalId !== undefined) entity.goalId = this.goalId;
    if (this.startAt !== undefined) entity.startAt = this.startAt;
    if (this.endAt !== undefined) entity.endAt = this.endAt;
    if (this.trackTimeIds !== undefined) entity.trackTimeIds = this.trackTimeIds;
  }
}

export class UpdateTaskDto extends IntersectionType(
  PartialType(CreateTaskDto),
  PickType(Task, ['id'] as const),
  PickType(TaskDto, ['status', 'doneAt', 'abandonedAt'] as const)
) {
  // VO → DTO
  importUpdateVo(vo: TaskVO.UpdateTaskVo) {
    if (vo.name !== undefined) this.name = vo.name;
    if (vo.description !== undefined) this.description = vo.description;
    if (vo.tags !== undefined) this.tags = vo.tags;
    if (vo.estimateTime !== undefined) this.estimateTime = vo.estimateTime;
    if (vo.importance !== undefined) this.importance = vo.importance;
    if (vo.urgency !== undefined) this.urgency = vo.urgency;
    if (vo.goalId !== undefined) this.goalId = vo.goalId;
    if (vo.startAt !== undefined) this.startAt = new Date(vo.startAt);
    if (vo.endAt !== undefined) this.endAt = new Date(vo.endAt);
    if (vo.parentId !== undefined) this.parentId = vo.parentId;
  }

  appendToUpdateEntity(entity: Task) {
    if (!entity.id) entity.id = this.id;
    else if (entity.id !== this.id) throw new Error('ID不匹配');
    if (this.name !== undefined) entity.name = this.name;
    if (this.description !== undefined) entity.description = this.description;
    if (this.tags !== undefined) entity.tags = this.tags;
    if (this.estimateTime !== undefined) entity.estimateTime = this.estimateTime;
    if (this.importance !== undefined) entity.importance = this.importance;
    if (this.urgency !== undefined) entity.urgency = this.urgency;
    if (this.goalId !== undefined) entity.goalId = this.goalId;
    if (this.startAt !== undefined) entity.startAt = this.startAt;
    if (this.endAt !== undefined) entity.endAt = this.endAt;
    if (this.status !== undefined) entity.status = this.status;
    if (this.doneAt !== undefined) entity.doneAt = this.doneAt;
    if (this.abandonedAt !== undefined) entity.abandonedAt = this.abandonedAt;
  }
}
