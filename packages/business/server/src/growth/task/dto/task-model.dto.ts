import { Task, TaskModel } from "../task.entity";
import { BaseModelDto } from "../../../base/base-model.dto";
import { OmitType, IntersectionType } from "@life-toolkit/mapped-types";
import { GoalDto } from "../../goal/dto";
import { TrackTimeDto } from "../../track-time/dto";
import { TodoDto } from "../../todo/dto";
import dayjs from "dayjs";
import { BaseMapper } from "../../../base/base.mapper";
import type { Task as TaskVO } from "@life-toolkit/vo";

export class TaskDto extends IntersectionType(
  BaseModelDto,
  OmitType(Task, ["children", "parent", "goal", "todoList"] as const)
) {
  children?: TaskDto[];
  parent?: TaskDto;
  goal?: GoalDto;
  trackTimeList?: TrackTimeDto[];
  todoList?: TodoDto[];

  // Entity → DTO (实例方法)
  importEntity(entity: Task) {
    Object.assign(this, BaseMapper.entityToDto(entity));
    // 关联对象映射（浅拷贝，避免循环引用）
    if (entity.parent) this.parent = entity.parent as any;
    if (entity.children) this.children = entity.children as any;
    if (entity.goal) this.goal = entity.goal as any;
    if (entity.todoList) this.todoList = entity.todoList as any;
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
      startAt: this.startAt
        ? dayjs(this.startAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      endAt: this.endAt
        ? dayjs(this.endAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      doneAt: this.doneAt
        ? dayjs(this.doneAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      abandonedAt: this.abandonedAt
        ? dayjs(this.abandonedAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      children: this.children?.map((child) => child.exportVo()) || [],
      parent: this.parent?.exportVo(),
      goal: this.goal?.exportVo(),
      todoList: this.todoList?.map((todo) => todo.exportVo()),
    };
  }

  // DTO → 列表项 VO（简化）
  exportModelVo(): TaskVO.TaskModelVo {
    return {
      ...BaseMapper.dtoToVo(this),
      name: this.name,
      status: this.status,
      startAt: this.startAt
        ? dayjs(this.startAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      endAt: this.endAt
        ? dayjs(this.endAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      doneAt: this.doneAt
        ? dayjs(this.doneAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      abandonedAt: this.abandonedAt
        ? dayjs(this.abandonedAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      estimateTime: this.estimateTime,
      importance: this.importance,
      urgency: this.urgency,
      tags: this.tags,
    };
  }

  // 列表/分页辅助
  static dtoListToListVo(list: TaskDto[]): TaskVO.TaskListVo {
    return { list: list.map((d) => d.exportModelVo()) };
  }
  
  static dtoListToPageVo(
    list: TaskDto[],
    total: number,
    pageNum: number,
    pageSize: number
  ): TaskVO.TaskPageVo {
    return {
      list: list.map((d) => d.exportModelVo()),
      total,
      pageNum,
      pageSize,
    };
  }
}

export class TaskModelDto extends OmitType(TaskDto, [
  "children",
  "parent",
  "goal",
  "trackTimeList",
  "todoList",
] as const) {}
