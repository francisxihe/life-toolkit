import dayjs from 'dayjs';
import { BaseModelDto, BaseMapper } from '@business/common';
import { IntersectionType } from 'francis-mapped-types';
import { TodoRepeat, TodoRepeatWithoutRelations } from '../todo-repeat.entity';
import type { Todo as TodoVO } from '@true-north/vo';
import { TodoRelatedType, TodoStatus } from '@true-north/enum';
import type { RepeatConfigPayload } from '@true-north/components-repeat/types';
import { RepeatEndMode, RepeatMode } from '@true-north/components-repeat/types';
import type { Repeat } from '../../repeat/repeat.entity';

function toHm(value?: string): string | undefined {
  if (!value) return undefined;
  const [hour, minute] = value.split(':');
  if (hour === undefined || minute === undefined) return undefined;
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

export class TodoRepeatWithoutRelationsDto extends TodoRepeatWithoutRelations {
  /** 以下字段由关联 Repeat 展平，供 API / VO 兼容 */
  repeatMode!: RepeatMode;
  repeatConfig?: RepeatConfigPayload;
  repeatEndMode!: RepeatEndMode;
  repeatEndDate?: string;
  repeatTimes?: number;
  repeatStartDate!: string;
  currentDate!: string;
}

export class TodoRepeatDto extends IntersectionType(BaseModelDto, TodoRepeatWithoutRelationsDto) {
  /** 已物化实例数（手动统计，非 TypeORM 关系） */
  settledTimes?: number;

  importEntity(entity: TodoRepeat) {
    Object.assign(this, BaseMapper.entityToDto(entity));
    this.name = entity.name;
    this.description = entity.description;
    this.importance = entity.importance;
    this.urgency = entity.urgency;
    this.planStartTime = toHm(entity.planStartTime);
    this.planEndTime = toHm(entity.planEndTime);
    this.status = entity.status;
    this.abandonedAt = entity.abandonedAt;
    this.repeatId = entity.repeatId;
    this.applyRepeat(entity.repeat);
  }

  applyRepeat(repeat?: Repeat) {
    if (!repeat) return;
    this.repeatStartDate = repeat.repeatStartDate;
    this.repeatMode = repeat.repeatMode;
    this.repeatConfig = repeat.repeatConfig;
    this.repeatEndMode = repeat.repeatEndMode;
    this.repeatEndDate = repeat.repeatEndDate;
    this.repeatTimes = repeat.repeatTimes;
    this.currentDate = repeat.currentDate;
  }

  exportVo(): TodoVO.TodoVo {
    return {
      id: this.id,
      name: this.name || '',
      description: this.description || '',
      importance: this.importance,
      urgency: this.urgency,
      status: TodoStatus.TODO,
      abandonedAt: this.abandonedAt ? dayjs(this.abandonedAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      createdAt: dayjs(this.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs(this.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
      planDate: dayjs(this.currentDate).format('YYYY-MM-DD'),
      planStartTime: toHm(this.planStartTime),
      planEndTime: toHm(this.planEndTime),
      relatedType: TodoRelatedType.IS_REPEAT,
      relatedId: this.id,
      settledTimes: this.settledTimes ?? 0,
      repeatConfig: {
        currentDate: dayjs(this.currentDate).format('YYYY-MM-DD'),
        repeatStartDate: dayjs(this.repeatStartDate).format('YYYY-MM-DD'),
        repeatMode: this.repeatMode,
        repeatConfig: this.repeatConfig,
        repeatEndMode: this.repeatEndMode,
        repeatEndDate: this.repeatEndDate,
        repeatTimes: this.repeatTimes,
      },
    };
  }
}
