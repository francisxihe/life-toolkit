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

  // Entity → DTO
  importEntity(entity: Task) {
    Object.assign(this, BaseMapper.entityToDto(entity));
    // 关联对象映射（浅拷贝，避免循环引用）
    this.parent = entity.parent as any;
    this.children = entity.children as any;
    this.goal = entity.goal as any;
    this.todoList = entity.todoList as any;
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
  exportModelVo(): TaskVO.TaskItemVo {
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
