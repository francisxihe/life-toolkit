import { Habit, HabitWithoutRelations } from '../habit.entity';
import { BaseModelDto, BaseMapper } from '@business/common';
import { OmitType, IntersectionType } from 'francis-mapped-types';
import dayjs from 'dayjs';
import type { Habit as HabitVO, ResponseListVo, ResponsePageVo } from '@life-toolkit/vo';
import { GoalDto } from '../../goal';
import { TodoDto } from '../../todo';

export class HabitWithoutRelationsDto extends IntersectionType(BaseModelDto, HabitWithoutRelations) {}

export class HabitDto extends IntersectionType(BaseModelDto, HabitWithoutRelationsDto) {
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
    this.startDate = entity.startDate;
    this.targetDate = entity.targetDate;

    // 关联对象映射（浅拷贝，避免循环引用）
    if (entity.goals) {
      this.goals = entity.goals.map((goal) => {
        const goalDto = new GoalDto();
        goalDto.importEntity(goal);
        return goalDto;
      });
    }
    if (entity.todos) {
      this.todos = entity.todos.map((todo) => {
        const todoDto = new TodoDto();
        todoDto.importEntity(todo);
        return todoDto;
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
      startDate: dayjs(this.startDate).format('YYYY-MM-DD HH:mm:ss'),
      targetDate: dayjs(this.targetDate).format('YYYY-MM-DD HH:mm:ss'),
      tags: this.tags,
      difficulty: this.difficulty,
      importance: this.importance,
      completedCount: this.completedCount,
      currentStreak: this.currentStreak,
      longestStreak: this.longestStreak,
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
