import { Habit } from "../habit.entity";
import { BaseModelDto } from "../../../base/base-model.dto";
import { OmitType, IntersectionType } from "@life-toolkit/mapped-types";
import dayjs from "dayjs";
import { BaseMapper } from "../../../base/base.mapper";
import type { Habit as HabitVO } from "@life-toolkit/vo";
import { GoalDto } from "../../goal";
import { TodoDto } from "../../todo";

export class HabitDto extends IntersectionType(
  BaseModelDto,
  OmitType(Habit, ["goals", "todos"] as const)
) {
  goals?: GoalDto[];
  todos?: TodoDto[];

  // Entity → DTO (实例方法)
  importEntity(entity: Habit) {
    Object.assign(this, BaseMapper.entityToDto(entity));
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
  exportModelVo(): HabitVO.HabitModelVo {
    return {
      ...BaseMapper.dtoToVo(this),
      name: this.name,
      status: this.status,
      startAt: this.startDate
        ? dayjs(this.startDate).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      endAt: this.targetDate
        ? dayjs(this.targetDate).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
    };
  }

  // DTO → 业务完整 VO
  exportVo(): HabitVO.HabitVo {
    return {
      ...this.exportModelVo(),
      goals: this.goals?.map((goal) => goal.exportVo()),
      todos: this.todos?.map((todo) => todo.exportVo()),
    };
  }

  // 列表/分页辅助
  static dtoListToListVo(list: HabitDto[]): HabitVO.HabitListVo {
    return { list: list.map((d) => d.exportModelVo()) };
  }
  
  static dtoListToPageVo(
    list: HabitDto[],
    total: number,
    pageNum: number,
    pageSize: number
  ): HabitVO.HabitPageVo {
    return {
      list: list.map((d) => d.exportModelVo()),
      total,
      pageNum,
      pageSize,
    };
  }
}
