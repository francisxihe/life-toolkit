import { TodoRepeatDto } from './todo-repeat-model.dto';
import { PickType, IntersectionType, PartialType } from 'francis-mapped-types';
import { TodoRepeat } from '../todo-repeat.entity';
import type { Todo as TodoVO } from '@true-north/vo';
import { TodoRepeatStatus } from '@true-north/enum';
import type { RepeatRuleInput } from '../../repeat/repeat.service';

export class CreateTodoRepeatDto extends PickType(TodoRepeatDto, [
  'name',
  'description',
  'importance',
  'urgency',
  'status',
  'currentDate',
  'repeatStartDate',
  'repeatMode',
  'repeatConfig',
  'repeatEndMode',
  'repeatEndDate',
  'repeatTimes',
  'planStartTime',
  'planEndTime',
] as const) {
  importCreateVo(vo: TodoVO.CreateTodoVo) {
    if (!vo.repeatConfig) {
      throw new Error('重复配置不能为空');
    }
    this.name = vo.name;
    this.description = vo.description;
    this.importance = vo.importance;
    this.urgency = vo.urgency;
    this.repeatStartDate = vo.repeatConfig.repeatStartDate;
    this.currentDate = vo.repeatConfig.currentDate;
    this.repeatMode = vo.repeatConfig.repeatMode;
    this.repeatConfig = vo.repeatConfig.repeatConfig;
    this.repeatEndMode = vo.repeatConfig.repeatEndMode;
    this.repeatEndDate = vo.repeatConfig.repeatEndDate;
    this.repeatTimes = vo.repeatConfig.repeatTimes;
    this.planStartTime = vo.planStartTime;
    this.planEndTime = vo.planEndTime;
  }

  toRepeatRuleInput(): RepeatRuleInput {
    return {
      repeatMode: this.repeatMode,
      repeatConfig: this.repeatConfig,
      repeatEndMode: this.repeatEndMode,
      repeatEndDate: this.repeatEndDate,
      repeatTimes: this.repeatTimes,
      repeatStartDate: this.repeatStartDate,
      currentDate: this.currentDate || this.repeatStartDate,
    };
  }

  exportCreateEntity(repeatId: string) {
    const todoRepeat = new TodoRepeat();

    if (this.name !== undefined) todoRepeat.name = this.name;
    if (this.description !== undefined) todoRepeat.description = this.description;
    if (this.importance !== undefined) todoRepeat.importance = this.importance;
    if (this.urgency !== undefined) todoRepeat.urgency = this.urgency;
    todoRepeat.status = this.status ?? TodoRepeatStatus.ACTIVE;
    if (this.planStartTime !== undefined) todoRepeat.planStartTime = this.planStartTime;
    if (this.planEndTime !== undefined) todoRepeat.planEndTime = this.planEndTime;
    todoRepeat.repeatId = repeatId;

    return todoRepeat;
  }
}

export class UpdateTodoRepeatDto extends IntersectionType(
  PartialType(CreateTodoRepeatDto),
  PickType(TodoRepeat, ['id'] as const),
  PickType(TodoRepeatDto, ['abandonedAt', 'repeatId'] as const)
) {
  importUpdateVo(vo: TodoVO.UpdateTodoVo) {
    this.name = vo.name;
    this.description = vo.description;
    this.importance = vo.importance;
    this.urgency = vo.urgency;
    this.repeatStartDate = vo.repeatConfig?.repeatStartDate;
    this.repeatMode = vo.repeatConfig?.repeatMode;
    this.repeatConfig = vo.repeatConfig?.repeatConfig;
    this.repeatEndMode = vo.repeatConfig?.repeatEndMode;
    this.repeatEndDate = vo.repeatConfig?.repeatEndDate;
    this.repeatTimes = vo.repeatConfig?.repeatTimes;
    this.planStartTime = vo.planStartTime;
    this.planEndTime = vo.planEndTime;
    const nextCurrentDate = vo.planDate || vo.repeatConfig?.currentDate;
    if (nextCurrentDate) {
      this.currentDate = nextCurrentDate;
    }
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
    if (this.status === undefined) this.status = todoRepeat.status;
    if (this.abandonedAt === undefined) this.abandonedAt = todoRepeat.abandonedAt;
    if (this.planStartTime === undefined) this.planStartTime = todoRepeat.planStartTime;
    if (this.planEndTime === undefined) this.planEndTime = todoRepeat.planEndTime;
    if (this.repeatId === undefined) this.repeatId = todoRepeat.repeatId;

    const repeat = todoRepeat.repeat;
    if (repeat) {
      if (this.repeatStartDate === undefined) this.repeatStartDate = repeat.repeatStartDate;
      if (this.currentDate === undefined) this.currentDate = repeat.currentDate;
      if (this.repeatMode === undefined) this.repeatMode = repeat.repeatMode;
      if (this.repeatConfig === undefined) this.repeatConfig = repeat.repeatConfig;
      if (this.repeatEndMode === undefined) this.repeatEndMode = repeat.repeatEndMode;
      if (this.repeatEndDate === undefined) this.repeatEndDate = repeat.repeatEndDate;
      if (this.repeatTimes === undefined) this.repeatTimes = repeat.repeatTimes;
    }
  }

  hasRepeatRuleUpdate(): boolean {
    return [
      this.repeatMode,
      this.repeatConfig,
      this.repeatEndMode,
      this.repeatEndDate,
      this.repeatTimes,
      this.repeatStartDate,
      this.currentDate,
    ].some((value) => value !== undefined);
  }

  toRepeatRulePartial(): Partial<RepeatRuleInput> {
    const partial: Partial<RepeatRuleInput> = {};
    if (this.repeatMode !== undefined) partial.repeatMode = this.repeatMode;
    if (this.repeatConfig !== undefined) partial.repeatConfig = this.repeatConfig;
    if (this.repeatEndMode !== undefined) partial.repeatEndMode = this.repeatEndMode;
    if (this.repeatEndDate !== undefined) partial.repeatEndDate = this.repeatEndDate;
    if (this.repeatTimes !== undefined) partial.repeatTimes = this.repeatTimes;
    if (this.repeatStartDate !== undefined) partial.repeatStartDate = this.repeatStartDate;
    if (this.currentDate !== undefined) partial.currentDate = this.currentDate;
    return partial;
  }

  exportUpdateEntity() {
    const todoRepeat = new TodoRepeat();
    todoRepeat.id = this.id;
    if (this.name !== undefined) todoRepeat.name = this.name;
    if (this.description !== undefined) todoRepeat.description = this.description;
    if (this.importance !== undefined) todoRepeat.importance = this.importance;
    if (this.urgency !== undefined) todoRepeat.urgency = this.urgency;
    if (this.status !== undefined) todoRepeat.status = this.status;
    if (this.abandonedAt !== undefined) todoRepeat.abandonedAt = this.abandonedAt;
    if (this.planStartTime !== undefined) todoRepeat.planStartTime = this.planStartTime;
    if (this.planEndTime !== undefined) todoRepeat.planEndTime = this.planEndTime;
    return todoRepeat;
  }
}
