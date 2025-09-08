import { Goal } from '../goal.entity';
import { BaseModelDto, BaseMapper } from '@business/common';
import { OmitType, IntersectionType } from '@life-toolkit/mapped-types';
import dayjs from 'dayjs';
import type { Goal as GoalVO } from '@life-toolkit/vo';
import { TaskDto } from '../../task';

// 基础DTO - 包含所有字段
export class GoalDto extends IntersectionType(
  BaseModelDto,
  OmitType(Goal, ['children', 'parent', 'taskList'] as const)
) {
  importVo(body: Partial<GoalVO.CreateGoalVo>) {
    throw new Error('Method not implemented.');
  }
  children?: GoalDto[];
  parent?: GoalDto;
  taskList?: TaskDto[];

  // Entity → DTO (实例方法)
  importEntity(entity: Goal) {
    Object.assign(this, BaseMapper.entityToDto(entity));
    this.name = entity.name;
    this.description = entity.description;
    this.status = entity.status;
    this.importance = entity.importance;
    this.difficulty = entity.difficulty;
    this.type = entity.type;
    this.startAt = entity.startAt;
    this.endAt = entity.endAt;
    this.doneAt = entity.doneAt;
    this.abandonedAt = entity.abandonedAt;
    
    // 关联对象映射（浅拷贝，避免循环引用）
    if (entity.parent) this.parent = GoalDto.importEntity(entity.parent);
    if (entity.children) this.children = entity.children.map((child) => GoalDto.importEntity(child));
    if (entity.taskList) this.taskList = entity.taskList.map((task) => TaskDto.importEntity(task));
  }

  // Entity → DTO (静态方法)
  static importEntity(entity: Goal): GoalDto {
    const dto = new GoalDto();
    dto.importEntity(entity);
    return dto;
  }

  // DTO → 列表项 VO（简化）
  exportModelVo(): GoalVO.GoalModelVo {
    return {
      ...BaseMapper.dtoToVo(this),
      name: this.name,
      status: this.status,
      startAt: this.startAt ? dayjs(this.startAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      endAt: this.endAt ? dayjs(this.endAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      doneAt: this.doneAt ? dayjs(this.doneAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      abandonedAt: this.abandonedAt ? dayjs(this.abandonedAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
    } as GoalVO.GoalModelVo;
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

  // 列表/分页辅助
  static dtoListToListVo(list: GoalDto[]): GoalVO.GoalListVo {
    return { list: list.map((d) => d.exportModelVo()) };
  }

  static dtoListToPageVo(list: GoalDto[], total: number, pageNum: number, pageSize: number): GoalVO.GoalPageVo {
    return {
      list: list.map((d) => d.exportModelVo()),
      total,
      pageNum,
      pageSize,
    };
  }
}

// 模型DTO - 排除关联字段
export class GoalModelDto extends OmitType(GoalDto, ['children', 'parent', 'taskList'] as const) {}
