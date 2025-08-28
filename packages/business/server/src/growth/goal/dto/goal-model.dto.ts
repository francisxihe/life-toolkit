import { Goal } from "../goal.entity";
import { BaseModelDto } from "../../../base/base-model.dto";
import { OmitType, IntersectionType } from "@life-toolkit/mapped-types";
import dayjs from "dayjs";
import { BaseMapper } from "../../../base/base.mapper";
import type { Goal as GoalVO } from "@life-toolkit/vo";
import { TaskDto } from "../../task";

// 基础DTO - 包含所有字段
export class GoalDto extends IntersectionType(
  BaseModelDto,
  OmitType(Goal, ["children", "parent", "taskList"] as const)
) {
  children?: GoalDto[];
  parent?: GoalDto;
  taskList?: TaskDto[];

  // Entity → DTO
  importEntity(entity: Goal) {
    Object.assign(this, BaseMapper.entityToDto(entity));
    // 关联对象映射（浅拷贝，避免循环引用）
    this.parent = entity.parent as any;
    this.children = entity.children as any;
    this.taskList = entity.taskList as any;
  }

  // DTO → 列表项 VO（简化）
  exportModelVo(): GoalVO.GoalItemVo {
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
    } as GoalVO.GoalItemVo;
  }

  // DTO → 业务完整 VO
  exportVo(): GoalVO.GoalVo {
    return {
      ...this.exportModelVo(),
      children: this.children?.map((child) => child.exportVo()) || [],
      parent: this.parent?.exportVo(),
      taskList: this.taskList?.map((task) => task.exportVo()),
    };
  }
}

// 模型DTO - 排除关联字段
export class GoalModelDto extends OmitType(GoalDto, [
  "children",
  "parent",
  "taskList",
] as const) {}
