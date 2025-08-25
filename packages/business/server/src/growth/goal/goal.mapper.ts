import type { Goal as GoalVO } from "@life-toolkit/vo";
import { CreateGoalDto, UpdateGoalDto, GoalDto, GoalModelDto } from "./dto";
import { Goal } from "./goal.entity";
import { BaseMapper } from "../../base/base.mapper";
import dayjs from "dayjs";
import { GoalType } from "@life-toolkit/enum";

// 最终导出类
export class GoalMapper {
  // ==================== Entity ↔ DTO ====================

  /**
   * 实体转模型DTO
   */
  static entityToModelDto(entity: Goal): GoalModelDto {
    const dto = new GoalModelDto();
    Object.assign(dto, BaseMapper.entityToDto(entity));

    // 基础字段映射
    dto.name = entity.name;
    dto.description = entity.description;
    dto.status = entity.status;
    dto.type = entity.type;
    dto.importance = entity.importance;
    dto.difficulty = entity.difficulty;

    // 日期字段映射 (保持Date类型)
    dto.startAt = entity.startAt;
    dto.endAt = entity.endAt;
    dto.doneAt = entity.doneAt;
    dto.abandonedAt = entity.abandonedAt;

    return dto;
  }

  /**
   * 实体转完整DTO
   */
  static entityToDto(entity: Goal): GoalDto {
    const dto = new GoalDto();
    Object.assign(dto, this.entityToModelDto(entity));

    // 关联字段映射 (简化处理，避免循环引用)
    dto.parent = entity.parent;
    dto.children = entity.children;
    dto.taskList = entity.taskList;

    return dto;
  }

  // ==================== DTO ↔ VO ====================

  /**
   * DTO转项目VO
   */
  static dtoToItemVo(dto: GoalDto): GoalVO.GoalItemVo {
    const vo: GoalVO.GoalItemVo = {
      // 基础字段
      ...BaseMapper.dtoToVo(dto),

      // 业务字段
      name: dto.name,
      description: dto.description,
      status: dto.status,
      type: dto.type,
      importance: dto.importance,
      difficulty: dto.difficulty,

      // 日期字段转换 (Date → string)
      startAt: dto.startAt
        ? dayjs(dto.startAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      endAt: dto.endAt
        ? dayjs(dto.endAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      doneAt: dto.doneAt
        ? dayjs(dto.doneAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      abandonedAt: dto.abandonedAt
        ? dayjs(dto.abandonedAt).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
    };

    return vo;
  }

  /**
   * DTO转完整VO
   */
  static dtoToVo(dto: GoalDto): GoalVO.GoalVo {
    const itemVo = this.dtoToItemVo(dto);
    const vo: any = {
      ...itemVo,

      // 关联数据字段
      parent: dto.parent ? this.dtoToItemVo(dto.parent) : undefined,
      children: dto.children
        ? dto.children.map((child) => this.dtoToVo(child))
        : [],
      taskList: dto.taskList || [], // 简化处理，需要时单独加载
    };

    return vo;
  }

  /**
   * DTO列表转VO列表
   */
  static dtoToVoList(dtoList: GoalDto[]): GoalVO.GoalItemVo[] {
    return dtoList.map((dto) => this.dtoToItemVo(dto));
  }

  /**
   * DTO转分页VO
   */
  static dtoToPageVo(
    dtoList: GoalDto[],
    total: number,
    pageNum: number,
    pageSize: number
  ): GoalVO.GoalPageVo {
    return {
      list: this.dtoToVoList(dtoList),
      total,
      pageNum,
      pageSize,
    };
  }

  /**
   * DTO转列表VO
   */
  static dtoToListVo(dtoList: GoalDto[]): GoalVO.GoalListVo {
    return {
      list: this.dtoToVoList(dtoList),
    };
  }

  // ==================== VO ↔ DTO ====================

  /**
   * 创建VO转DTO
   */
  static voToCreateDto(vo: GoalVO.CreateGoalVo): CreateGoalDto {
    const dto = new CreateGoalDto();

    // 基础字段
    dto.name = vo.name;
    dto.description = vo.description;
    dto.type = vo.type;
    dto.importance = vo.importance;
    dto.difficulty = vo.difficulty;
    dto.parentId = vo.parentId;

    // 日期字段转换 (string → Date)
    dto.startAt = vo.startAt ? dayjs(vo.startAt).toDate() : undefined;
    dto.endAt = vo.endAt ? dayjs(vo.endAt).toDate() : undefined;

    return dto;
  }

  /**
   * 更新VO转DTO
   */
  static voToUpdateDto(vo: GoalVO.UpdateGoalVo): UpdateGoalDto {
    const dto = new UpdateGoalDto();

    // 只更新提供的字段
    if (vo.name !== undefined) {
      dto.name = vo.name;
    }
    if (vo.description !== undefined) {
      dto.description = vo.description;
    }
    if (vo.type !== undefined) {
      dto.type = vo.type;
    }
    if (vo.importance !== undefined) {
      dto.importance = vo.importance;
    }
    if (vo.difficulty !== undefined) {
      dto.difficulty = vo.difficulty;
    }
    if (vo.parentId !== undefined) {
      dto.parentId = vo.parentId;
    }
    if (vo.startAt !== undefined) {
      dto.startAt = vo.startAt ? dayjs(vo.startAt).toDate() : undefined;
    }
    if (vo.endAt !== undefined) {
      dto.endAt = vo.endAt ? dayjs(vo.endAt).toDate() : undefined;
    }

    return dto;
  }
}
