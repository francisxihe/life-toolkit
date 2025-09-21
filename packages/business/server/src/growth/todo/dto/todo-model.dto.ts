import { BaseModelDto, BaseMapper } from '@business/common';
import { IntersectionType } from 'francis-mapped-types';
import { Todo, TodoWithoutRelations } from '../todo.entity';
import { TaskDto } from '../../task';
import { HabitDto } from '../../habit';
import { Todo as TodoVO } from '@life-toolkit/vo';
import dayjs from 'dayjs';
import { TodoStatus } from '@life-toolkit/enum';
import { TodoRepeatDto } from './todo-repeat-model.dto';

export class TodoWithoutRelationsDto extends IntersectionType(BaseModelDto, TodoWithoutRelations) {}

export class TodoDto extends TodoWithoutRelationsDto {
  task?: TaskDto;
  habit?: HabitDto;
  repeat?: TodoRepeatDto;
  // 重复配置内联对象 - 测试最终修复
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
    this.tags = entity.tags;
    this.importance = entity.importance;
    this.urgency = entity.urgency;
    this.planDate = entity.planDate;
    this.repeatId = entity.repeatId;
    this.source = entity.source;
    this.doneAt = entity.doneAt;
    this.abandonedAt = entity.abandonedAt;
    this.planStartAt = entity.planStartAt;
    this.planEndAt = entity.planEndAt;
    if (entity.task) {
      const taskDto = new TaskDto();
      taskDto.importEntity(entity.task);
      this.task = taskDto;
    }
    if (entity.repeat) {
      const repeatDto = new TodoRepeatDto();
      repeatDto.importEntity(entity.repeat);
      this.repeat = repeatDto;
    }
  }

  exportWithoutRelationsVo(): TodoVO.TodoWithoutRelationsVo {
    return {
      ...BaseMapper.dtoToVo(this),
      name: this.name || '',
      description: this.description,
      status: this.status ?? TodoStatus.TODO,
      tags: this.tags,
      importance: this.importance,
      urgency: this.urgency,
      planDate: dayjs(this.planDate).format('YYYY-MM-DD'),
      planStartAt: this.planStartAt ? dayjs(this.planStartAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      planEndAt: this.planEndAt ? dayjs(this.planEndAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      doneAt: this.doneAt ? dayjs(this.doneAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      abandonedAt: this.abandonedAt ? dayjs(this.abandonedAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      source: this.source,
    };
  }

  exportVo(): TodoVO.TodoVo {
    return {
      ...this.exportWithoutRelationsVo(),
      task: this.task ? this.task.exportVo() : undefined,
    };
  }
}
