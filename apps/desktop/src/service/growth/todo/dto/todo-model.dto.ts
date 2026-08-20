import { BaseModelDto, BaseMapper } from '@business/common';
import { IntersectionType } from 'francis-mapped-types';
import { Todo, TodoWithoutRelations } from '../todo.entity';
import { TaskDto } from '../../task/dto/task-model.dto';
import { HabitDto } from '../../habit/dto/habit-model.dto';
import { Todo as TodoVO } from '@true-north/vo';
import dayjs from 'dayjs';
import { TodoStatus } from '@true-north/enum';
import { TodoRepeatDto } from './todo-repeat-model.dto';
import { TodoRelatedType } from '@true-north/enum';
import { deriveCompatIds } from '../todo-related';

export class TodoWithoutRelationsDto extends IntersectionType(BaseModelDto, TodoWithoutRelations) {
  /** VO 兼容：由 relatedType/relatedId 派生 */
  taskId?: string;
  habitId?: string;
  repeatId?: string;
}

export class TodoDto extends TodoWithoutRelationsDto {
  task?: TaskDto;
  habit?: HabitDto;
  repeat?: TodoRepeatDto;
  // 重复配置内联对象
  repeatConfig?: {
    currentDate: TodoRepeatDto['currentDate'];
    repeatStartDate: TodoRepeatDto['repeatStartDate'];
    repeatMode: TodoRepeatDto['repeatMode'];
    repeatConfig: TodoRepeatDto['repeatConfig'];
    repeatEndMode: TodoRepeatDto['repeatEndMode'];
    repeatEndDate: TodoRepeatDto['repeatEndDate'];
    repeatTimes: TodoRepeatDto['repeatTimes'];
  };

  importEntity(entity: Todo) {
    Object.assign(this, BaseMapper.entityToDto(entity));
    this.name = entity.name;
    this.description = entity.description;
    this.status = entity.status;
    this.importance = entity.importance;
    this.urgency = entity.urgency;
    this.planDate = entity.planDate;
    this.relatedId = entity.relatedId;
    this.relatedType = entity.relatedType;
    const compat = deriveCompatIds(entity);
    this.taskId = compat.taskId;
    this.habitId = compat.habitId;
    this.repeatId = compat.repeatId;
    this.doneAt = entity.doneAt;
    this.abandonedAt = entity.abandonedAt;
    this.planStartTime = entity.planStartTime
      ? entity.planStartTime.slice(0, 5)
      : entity.planStartTime;
    this.planEndTime = entity.planEndTime
      ? entity.planEndTime.slice(0, 5)
      : entity.planEndTime;
  }

  exportWithoutRelationsVo(): TodoVO.TodoWithoutRelationsVo {
    const compat = deriveCompatIds({
      relatedType: this.relatedType,
      relatedId: this.relatedId,
    });
    return {
      ...BaseMapper.dtoToVo(this),
      name: this.name || '',
      description: this.description,
      status: this.status ?? TodoStatus.TODO,
      importance: this.importance,
      urgency: this.urgency,
      planDate: dayjs(this.planDate).format('YYYY-MM-DD'),
      planStartTime: this.planStartTime,
      planEndTime: this.planEndTime,
      doneAt: this.doneAt ? dayjs(this.doneAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      abandonedAt: this.abandonedAt ? dayjs(this.abandonedAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      relatedType: this.relatedType || TodoRelatedType.NONE,
      relatedId: this.relatedId,
      taskId: compat.taskId ?? this.taskId,
      habitId: compat.habitId ?? this.habitId,
      repeatId: compat.repeatId ?? this.repeatId,
    };
  }

  exportVo(): TodoVO.TodoVo {
    return {
      ...this.exportWithoutRelationsVo(),
      task: this.task ? this.task.exportVo() : undefined,
      repeatConfig: this.repeatConfig,
    };
  }
}
