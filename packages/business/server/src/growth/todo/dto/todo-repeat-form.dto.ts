import { TodoRepeatDto } from './todo-repeat-model.dto';
import { PickType, IntersectionType, PartialType, OmitType } from 'francis-mapped-types';
import { TodoRepeat } from '../todo-repeat.entity';
import type { Todo as TodoVO } from '@life-toolkit/vo';

export class CreateTodoRepeatDto extends PickType(TodoRepeatDto, [
  'name',
  'description',
  'importance',
  'urgency',
  'tags',
  'status',
  'currentDate',
  'repeatStartDate',
  'repeatMode',
  'repeatConfig',
  'repeatEndMode',
  'repeatEndDate',
  'repeatTimes',
] as const) {
  importCreateVo(vo: TodoVO.CreateTodoVo) {
    if (!vo.repeatConfig) {
      throw new Error('重复配置不能为空');
    }
    this.name = vo.name;
    this.description = vo.description;
    this.importance = vo.importance;
    this.urgency = vo.urgency;
    this.tags = vo.tags;
    this.repeatStartDate = vo.repeatConfig.repeatStartDate;
    this.currentDate = vo.repeatConfig.currentDate;
    this.repeatMode = vo.repeatConfig.repeatMode;
    this.repeatConfig = vo.repeatConfig.repeatConfig;
    this.repeatEndMode = vo.repeatConfig.repeatEndMode;
    this.repeatEndDate = vo.repeatConfig.repeatEndDate;
    this.repeatTimes = vo.repeatConfig.repeatTimes;
  }

  exportCreateEntity() {
    const todoRepeat = new TodoRepeat();

    if (this.name !== undefined) todoRepeat.name = this.name;
    if (this.description !== undefined) todoRepeat.description = this.description;
    if (this.importance !== undefined) todoRepeat.importance = this.importance;
    if (this.urgency !== undefined) todoRepeat.urgency = this.urgency;
    if (this.tags !== undefined) todoRepeat.tags = this.tags;
    if (this.status !== undefined) todoRepeat.status = this.status;

    if (this.repeatStartDate !== undefined) todoRepeat.repeatStartDate = this.repeatStartDate;
    if (this.currentDate !== undefined) todoRepeat.currentDate = this.currentDate;
    if (this.repeatMode !== undefined) todoRepeat.repeatMode = this.repeatMode;
    if (this.repeatConfig !== undefined) todoRepeat.repeatConfig = this.repeatConfig;
    if (this.repeatEndMode !== undefined) todoRepeat.repeatEndMode = this.repeatEndMode;
    if (this.repeatEndDate !== undefined) todoRepeat.repeatEndDate = this.repeatEndDate;
    if (this.repeatTimes !== undefined) todoRepeat.repeatTimes = this.repeatTimes;

    return todoRepeat;
  }
}

export class UpdateTodoRepeatDto extends IntersectionType(
  PartialType(CreateTodoRepeatDto),
  PickType(TodoRepeat, ['id'] as const),
  PickType(TodoRepeatDto, ['abandonedAt'] as const)
) {
  importUpdateVo(vo: TodoVO.UpdateTodoVo) {
    this.name = vo.name;
    this.description = vo.description;
    this.importance = vo.importance;
    this.urgency = vo.urgency;
    this.tags = vo.tags;
    this.repeatStartDate = vo.repeatConfig?.repeatStartDate;
    this.repeatMode = vo.repeatConfig?.repeatMode;
    this.repeatConfig = vo.repeatConfig?.repeatConfig;
    this.repeatEndMode = vo.repeatConfig?.repeatEndMode;
    this.repeatEndDate = vo.repeatConfig?.repeatEndDate;
    this.repeatTimes = vo.repeatConfig?.repeatTimes;
  }

  importUpdateEntity(todoRepeat: TodoRepeat) {
    if (this.id === undefined) {
      this.id = todoRepeat.id;
    } else if (this.id !== todoRepeat.id) {
      throw new Error('ID不匹配');
    }

    if (this.name === undefined) this.name = todoRepeat.name;
    if (this.description === undefined) this.description = todoRepeat.description;
    if (this.importance === undefined) this.importance = todoRepeat.importance;
    if (this.urgency === undefined) this.urgency = todoRepeat.urgency;
    if (this.tags === undefined) this.tags = todoRepeat.tags;
    if (this.repeatStartDate === undefined) this.repeatStartDate = todoRepeat.repeatStartDate;
    if (this.currentDate === undefined) this.currentDate = todoRepeat.currentDate;
    if (this.repeatMode === undefined) this.repeatMode = todoRepeat.repeatMode;
    if (this.repeatConfig === undefined) this.repeatConfig = todoRepeat.repeatConfig;
    if (this.repeatEndMode === undefined) this.repeatEndMode = todoRepeat.repeatEndMode;
    if (this.repeatEndDate === undefined) this.repeatEndDate = todoRepeat.repeatEndDate;
    if (this.repeatTimes === undefined) this.repeatTimes = todoRepeat.repeatTimes;
    if (this.status === undefined) this.status = todoRepeat.status;
    if (this.abandonedAt === undefined) this.abandonedAt = todoRepeat.abandonedAt;
  }

  exportUpdateEntity() {
    const todoRepeat = new TodoRepeat();
    todoRepeat.id = this.id;
    // 重复配置相关字段（来自 UpdateRepeatDto）
    if (this.repeatMode !== undefined) todoRepeat.repeatMode = this.repeatMode;
    if (this.repeatConfig !== undefined) todoRepeat.repeatConfig = this.repeatConfig;
    if (this.repeatEndMode !== undefined) todoRepeat.repeatEndMode = this.repeatEndMode;
    if (this.repeatEndDate !== undefined) todoRepeat.repeatEndDate = this.repeatEndDate;
    if (this.repeatTimes !== undefined) todoRepeat.repeatTimes = this.repeatTimes;
    if (this.name !== undefined) todoRepeat.name = this.name;
    if (this.description !== undefined) todoRepeat.description = this.description;
    if (this.importance !== undefined) todoRepeat.importance = this.importance;
    if (this.urgency !== undefined) todoRepeat.urgency = this.urgency;
    if (this.tags !== undefined) todoRepeat.tags = this.tags;
    if (this.repeatStartDate !== undefined) todoRepeat.repeatStartDate = this.repeatStartDate;
    if (this.currentDate !== undefined) todoRepeat.currentDate = this.currentDate;
    if (this.status !== undefined) todoRepeat.status = this.status;
    if (this.abandonedAt !== undefined) todoRepeat.abandonedAt = this.abandonedAt;
    return todoRepeat;
  }
}
