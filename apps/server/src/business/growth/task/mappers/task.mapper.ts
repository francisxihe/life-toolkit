import type { Task as TaskVO } from "@life-toolkit/vo";
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskDto,
  TaskWithTrackTimeDto,
} from "../dto";
import { TaskStatus, Task } from "../entities";
import { BaseMapper } from "@/base/base.mapper";
import dayjs from "dayjs";
import { TrackTimeMapper } from "../../track-time";
import { GoalMapper } from "../../goal/mappers";
import { TodoMapper } from "../../todo/mappers";

class TaskMapperEntity {
  static entityToDto(entity: Task): TaskDto {
    const dto = new TaskDto();
    Object.assign(dto, BaseMapper.entityToDto(entity));
    dto.name = entity.name;
    dto.description = entity.description;
    dto.status = entity.status;
    dto.importance = entity.importance;
    dto.urgency = entity.urgency;
    dto.doneAt = entity.doneAt;
    dto.abandonedAt = entity.abandonedAt;
    dto.startAt = entity.startAt;
    dto.endAt = entity.endAt;
    dto.estimateTime = entity.estimateTime;
    // 关联属性
    dto.parent = entity.parent
      ? TaskMapperEntity.entityToDto(entity.parent)
      : undefined;
    dto.children =
      entity.children?.map((child) => TaskMapperEntity.entityToDto(child)) ||
      [];
    dto.goal = entity.goal ? GoalMapper.entityToDto(entity.goal) : undefined;
    dto.trackTimeList = [];
    dto.todoList =
      entity.todoList?.map((todo) => TodoMapper.entityToDto(todo)) || [];
    dto.tags = entity.tags;
    return dto;
  }
}

class TaskMapperDto extends TaskMapperEntity {
  static dtoToVo(dto: TaskDto): TaskVO.TaskVo {
    return {
      ...BaseMapper.dtoToVo(dto),
      name: dto.name || "",
      description: dto.description,
      status: dto.status || TaskStatus.TODO,
      tags: dto.tags,
      importance: dto.importance,
      urgency: dto.urgency,
      startAt: dto.startAt
        ? dayjs(dto.startAt).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
      endAt: dto.endAt
        ? dayjs(dto.endAt).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
      doneAt: dto.doneAt
        ? dayjs(dto.doneAt).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
      abandonedAt: dto.abandonedAt
        ? dayjs(dto.abandonedAt).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
      estimateTime: dto.estimateTime,
      parent: dto.parent ? this.dtoToVo(dto.parent) : undefined,
      children: dto.children?.map((child) => this.dtoToVo(child)) || [],
      goal: dto.goal ? GoalMapper.dtoToVo(dto.goal) : undefined,
      trackTimeList: dto.trackTimeList?.map((trackTime) =>
        TrackTimeMapper.dtoToVo(trackTime)
      ),
      todoList: dto.todoList?.map((todo) => TodoMapper.dtoToVo(todo)),
    };
  }

  static dtoToVoList(dtoList: TaskDto[]): TaskVO.TaskVo[] {
    return dtoList.map((dto) => this.dtoToVo(dto));
  }

  static dtoToPageVo(
    dtoList: TaskDto[],
    total: number,
    pageNum: number,
    pageSize: number
  ): TaskVO.TaskPageVo {
    const vo = {
      list: this.dtoToVoList(dtoList),
      total,
      pageNum,
      pageSize,
    };
    return vo;
  }

  static dtoToListVo(dtoList: TaskDto[]): TaskVO.TaskListVo {
    const vo = {
      list: this.dtoToVoList(dtoList),
    };
    return vo;
  }


  static updateDtoToEntity(dto: UpdateTaskDto, entity?: Task): Task {
    if (!entity) {
      entity = new Task();
    }
    if (dto.name) entity.name = dto.name;
    if (dto.description) entity.description = dto.description;
    if (dto.importance) entity.importance = dto.importance;
    if (dto.urgency) entity.urgency = dto.urgency;
    if (dto.abandonedAt) entity.abandonedAt = dto.abandonedAt;
    if (dto.startAt) entity.startAt = dto.startAt;
    if (dto.endAt) entity.endAt = dto.endAt;
    if (dto.estimateTime) entity.estimateTime = dto.estimateTime;
    // 关联属性不走dtoToEntity
    return entity;
  }

}

class TaskMapperVo extends TaskMapperDto {
  static voToCreateDto(vo: TaskVO.CreateTaskVo): CreateTaskDto {
    const dto = new CreateTaskDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.tags = vo.tags || [];
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.parentId = vo.parentId;
    dto.goalId = vo.goalId;
    return dto;
  }

  static voToUpdateDto(vo: TaskVO.CreateTaskVo): UpdateTaskDto {
    const dto = new UpdateTaskDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.tags = vo.tags;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.parentId = vo.parentId;
    dto.goalId = vo.goalId;
    return dto;
  }
}

export class TaskMapper extends TaskMapperVo {
  static dtoToWithTrackTimeVo(
    dto: TaskWithTrackTimeDto
  ): TaskVO.TaskWithTrackTimeVo {
    const vo: TaskVO.TaskWithTrackTimeVo = {
      ...this.dtoToVo(dto as unknown as TaskDto),
      trackTimeList:
        dto.trackTimeList?.map((trackTime) => {
          return TrackTimeMapper.dtoToVo(trackTime);
        }) || [],
    };
    return vo;
  }
}
