import { Habit, HabitWithoutRelations } from '../habit.entity';
import { BaseModelDto, BaseMapper } from '@business/common';
import { IntersectionType } from 'francis-mapped-types';
import dayjs from 'dayjs';
import type { Habit as HabitVO, ResponseListVo, ResponsePageVo } from '@true-north/vo';
import { GoalDto } from '../../goal/dto/goal-model.dto';
import { TodoDto } from '../../todo/dto/todo-model.dto';
import type { RepeatConfigPayload } from '@true-north/components-repeat/types';
import { RepeatEndMode, RepeatMode } from '@true-north/components-repeat/types';

export class HabitWithoutRelationsDto extends IntersectionType(BaseModelDto, HabitWithoutRelations) {
  /** 由关联 Repeat 展平，供 API / VO 兼容 */
  repeatMode!: RepeatMode;
  repeatConfig?: RepeatConfigPayload;
  repeatEndMode!: RepeatEndMode;
  repeatEndDate?: string;
  repeatTimes?: number;
  repeatStartDate!: string;
}

export class HabitDto extends HabitWithoutRelationsDto {
  goals?: GoalDto[];
  todos?: TodoDto[];

  // Entity → DTO (实例方法)
  importEntity(entity: Habit) {
    Object.assign(this, BaseMapper.entityToDto(entity));
    this.name = entity.name;
    this.description = entity.description;
    this.status = entity.status;
    this.importance = entity.importance;
    this.difficulty = entity.difficulty;
    this.tags = entity.tags;
    this.repeatId = entity.repeatId;
    this.cycleTodoId = entity.cycleTodoId;
    this.cycleCount = entity.cycleCount;
    this.currentStreak = entity.currentStreak;
    this.longestStreak = entity.longestStreak;
    this.completedCount = entity.completedCount;
    this.doneAt = entity.doneAt;
    this.abandonedAt = entity.abandonedAt;

    if (entity.repeat) {
      this.repeatStartDate = entity.repeat.repeatStartDate;
      this.repeatEndDate = entity.repeat.repeatEndDate;
      this.repeatTimes = entity.repeat.repeatTimes;
      this.repeatMode = entity.repeat.repeatMode;
      this.repeatConfig = entity.repeat.repeatConfig;
      this.repeatEndMode = entity.repeat.repeatEndMode;
    }

    if (entity.goals) {
      this.goals = entity.goals.map((goal) => {
        const goalDto = new GoalDto();
        goalDto.importEntity(goal);
        return goalDto;
      });
    }
  }

  // Entity → DTO (静态方法)
  static importEntity(entity: Habit): HabitDto {
    const dto = new HabitDto();
    dto.importEntity(entity);
    return dto;
  }

  // DTO → 列表项 VO（简化）
  exportWithoutRelationsVo(): HabitVO.HabitWithoutRelationsVo {
    return {
      ...BaseMapper.dtoToVo(this),
      name: this.name,
      status: this.status,
      tags: this.tags,
      difficulty: this.difficulty,
      importance: this.importance,
      repeatId: this.repeatId,
      repeatStartDate: this.repeatStartDate,
      repeatMode: this.repeatMode,
      repeatConfig: this.repeatConfig,
      repeatEndMode: this.repeatEndMode,
      repeatEndDate: this.repeatEndDate,
      repeatTimes: this.repeatTimes,
      cycleTodoId: this.cycleTodoId,
      cycleCount: this.cycleCount,
      currentStreak: this.currentStreak,
      longestStreak: this.longestStreak,
      completedCount: this.completedCount,
      doneAt: this.doneAt ? dayjs(this.doneAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
      abandonedAt: this.abandonedAt ? dayjs(this.abandonedAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
    };
  }

  // DTO → 业务完整 VO
  exportVo(): HabitVO.HabitVo {
    return {
      ...this.exportWithoutRelationsVo(),
      goals: this.goals?.map((goal) => goal.exportVo()),
      todos: this.todos?.map((todo) => todo.exportVo()),
    };
  }

  // 列表/分页辅助
  static dtoListToListVo(list: HabitDto[]): ResponseListVo<HabitVO.HabitWithoutRelationsVo> {
    return { list: list.map((d) => d.exportWithoutRelationsVo()) };
  }

  static dtoListToPageVo(
    list: HabitDto[],
    total: number,
    pageNum: number,
    pageSize: number
  ): ResponsePageVo<HabitVO.HabitWithoutRelationsVo> {
    return {
      list: list.map((d) => d.exportWithoutRelationsVo()),
      total,
      pageNum,
      pageSize,
    };
  }
}
