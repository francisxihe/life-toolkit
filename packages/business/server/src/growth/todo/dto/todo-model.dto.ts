import { BaseModelDto, BaseMapper } from '@business/common';
import { IntersectionType, OmitType } from '@life-toolkit/mapped-types';
import { Todo, TodoWithoutRelations } from '../todo.entity';
import { TaskDto } from '../../task';
import { Todo as TodoVO } from '@life-toolkit/vo';
import dayjs from 'dayjs';
import { TodoStatus } from '@life-toolkit/enum';

export class TodoWithoutRelationsDto extends IntersectionType(BaseModelDto, TodoWithoutRelations) {}

export class TodoDto extends TodoWithoutRelationsDto {
  task?: TaskDto;
  habit?: any;

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
    // 关联属性（浅拷贝，避免递归）
    this.task = entity.task ? TaskDto.importEntity(entity.task) : undefined;
  }

  exportWithoutRelationsVo(): TodoVO.TodoVo {
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
      task: this.task ? this.task.exportVo() : undefined,
      source: this.source,
    };
  }

  exportVo(): TodoVO.TodoWithoutRelationsVo {
    return this.exportWithoutRelationsVo();
  }
}
