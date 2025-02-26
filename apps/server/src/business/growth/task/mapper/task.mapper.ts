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

class TaskMapperEntity {
  static entityToDto(entity: Task): TaskDto {
    const dto = new TaskDto();
    Object.assign(dto, BaseMapper.entityToDto(entity));
    dto.name = entity.name;
    dto.description = entity.description;
    dto.status = entity.status;
    dto.tags = entity.tags;
    dto.importance = entity.importance;
    dto.urgency = entity.urgency;
    dto.doneAt = entity.doneAt;
    dto.abandonedAt = entity.abandonedAt;
    dto.planStartAt = entity.planStartAt;
    dto.planEndAt = entity.planEndAt;
    dto.estimateTime = entity.estimateTime;
    dto.parent = entity.parent;
    dto.children = entity.children;
    return dto;
  }
}

class TaskMapperDto extends TaskMapperEntity {
  static dtoToVo(dto: TaskDto): TaskVO.TaskVo {
    const vo: TaskVO.TaskVo = {
      ...BaseMapper.dtoToVo(dto),
      name: dto.name || "",
      description: dto.description,
      status: dto.status || TaskStatus.TODO,
      tags: dto.tags,
      importance: dto.importance,
      urgency: dto.urgency,
      planStartAt: dto.planStartAt
        ? dayjs(dto.planStartAt).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
      planEndAt: dto.planEndAt
        ? dayjs(dto.planEndAt).format("YYYY/MM/DD HH:mm:ss")
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
    };
    return vo;
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
    return dto;
  }
}

export class TaskMapper extends TaskMapperVo {
  static dtoToWithTrackTimeVo(
    dto: TaskWithTrackTimeDto
  ): TaskVO.TaskWithTrackTimeVo {
    const vo: TaskVO.TaskWithTrackTimeVo = {
      ...this.dtoToVo(dto),
      trackTimeList:
        dto.trackTimeList?.map((trackTime) => {
          return TrackTimeMapper.dtoToVo(trackTime);
        }) || [],
    };
    return vo;
  }
}
