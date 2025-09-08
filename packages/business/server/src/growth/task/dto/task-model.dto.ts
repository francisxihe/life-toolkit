import { Task, TaskWithoutRelations } from '../task.entity';
import { BaseModelDto } from '@business/common/base-model.dto';
import { OmitType, IntersectionType } from '@life-toolkit/mapped-types';
import { GoalDto } from '../../goal';
import { TrackTimeDto } from '../../track-time';
import { TodoDto } from '../../todo';
import dayjs from 'dayjs';
import { BaseMapper } from '@business/common/base.mapper';
import type { Task as TaskVO } from '@life-toolkit/vo';

export class TaskWithoutRelationsDto extends TaskWithoutRelations {}

export class TaskDto extends IntersectionType(BaseModelDto, TaskWithoutRelationsDto) {
  children?: TaskDto[];
  parent?: TaskDto;
  goal?: GoalDto;
  trackTimeList?: TrackTimeDto[];
  todoList?: TodoDto[];

  // Entity → DTO (实例方法)
  importEntity(entity: Task) {
    Object.assign(this, BaseMapper.entityToDto(entity));
    this.name = entity.name;
    this.description = entity.description;
    this.status = entity.status;
    this.importance = entity.importance;
    this.startAt = entity.startAt;
    this.endAt = entity.endAt;
    this.doneAt = entity.doneAt;
    this.abandonedAt = entity.abandonedAt;
    this.estimateTime = entity.estimateTime;
    this.tags = entity.tags;
    this.importance = entity.importance;
    this.urgency = entity.urgency;

    // 关联对象映射（浅拷贝，避免循环引用）
    if (entity.parent) {
      const parentDto = new TaskDto();
      parentDto.importEntity(entity.parent);
      this.parent = parentDto;
    }
    if (entity.children) {
      this.children = entity.children.map((child) => {
        const childDto = new TaskDto();
        childDto.importEntity(child);
        return childDto;
      });
    }
    if (entity.goal) {
      const goalDto = new GoalDto();
      goalDto.importEntity(entity.goal);
      this.goal = goalDto;
    }
    if (entity.todoList) {
      this.todoList = entity.todoList.map((todo) => {
        const todoDto = new TodoDto();
        todoDto.importEntity(todo);
        return todoDto;
      });
    }
    // trackTimeList 通过关联查询获得，不直接从 entity 映射
  }

  // Entity → DTO (静态方法)
  static importEntity(entity: Task): TaskDto {
    const dto = new TaskDto();
    dto.importEntity(entity);
    return dto;
  }

  // DTO → 业务完整 VO
  exportVo(): TaskVO.TaskVo {
    return {
      ...BaseMapper.dtoToVo(this),
      name: this.name,
      status: this.status,
      startAt: this.startAt ? dayjs(this.startAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      endAt: this.endAt ? dayjs(this.endAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      doneAt: this.doneAt ? dayjs(this.doneAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      abandonedAt: this.abandonedAt ? dayjs(this.abandonedAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      children: this.children?.map((child) => child.exportVo()) || [],
      parent: this.parent?.exportVo(),
      goal: this.goal?.exportVo(),
      todoList: this.todoList?.map((todo) => todo.exportVo()),
    };
  }

  // DTO → 列表项 VO（简化）
  exportWithoutRelationsVo(): TaskVO.TaskWithoutRelationsVo {
    return {
      ...BaseMapper.dtoToVo(this),
      name: this.name,
      status: this.status,
      startAt: this.startAt ? dayjs(this.startAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      endAt: this.endAt ? dayjs(this.endAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      doneAt: this.doneAt ? dayjs(this.doneAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      abandonedAt: this.abandonedAt ? dayjs(this.abandonedAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      estimateTime: this.estimateTime,
      importance: this.importance,
      urgency: this.urgency,
      tags: this.tags,
    };
  }

  // 列表/分页辅助
  static dtoListToListVo(list: TaskDto[]): TaskVO.TaskListVo {
    return { list: list.map((d) => d.exportWithoutRelationsVo()) };
  }

  static dtoListToPageVo(list: TaskDto[], total: number, pageNum: number, pageSize: number): TaskVO.TaskPageVo {
    return {
      list: list.map((d) => d.exportWithoutRelationsVo()),
      total,
      pageNum,
      pageSize,
    };
  }
}
