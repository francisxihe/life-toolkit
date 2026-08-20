import { PickType, IntersectionType, PartialType } from 'francis-mapped-types';
import { TodoRelatedType, TodoStatus } from '@true-north/enum';
import { Todo as TodoVO } from '@true-north/vo';
import dayjs from 'dayjs';
import { TodoDto } from './todo-model.dto';
import { Todo } from '../todo.entity';
import { mapCompatIdsToRelated } from '../todo-related';

export class CreateTodoDto extends PickType(TodoDto, [
  'name',
  'description',
  'status',
  'planDate',
  'planStartTime',
  'planEndTime',
  'importance',
  'urgency',
  'relatedType',
  'relatedId',
  'repeatConfig',
  'taskId',
  'repeatId',
  'habitId',
] as const) {
  importCreateVo(vo: TodoVO.CreateTodoVo) {
    this.name = vo.name;
    this.description = vo.description;
    this.importance = vo.importance;
    this.urgency = vo.urgency;
    if (vo.planDate !== undefined) this.planDate = dayjs(vo.planDate).toDate();
    this.planStartTime = vo.planStartTime;
    this.planEndTime = vo.planEndTime;
    this.taskId = vo.taskId;
    this.habitId = vo.habitId;
    this.repeatId = vo.repeatId;
    this.relatedId = vo.relatedId;
    this.relatedType = vo.relatedType;
    this.status = vo.status;
  }

  exportCreateEntity(): Todo {
    const todo = new Todo();
    const related = mapCompatIdsToRelated({
      relatedType: this.relatedType,
      relatedId: this.relatedId,
      taskId: this.taskId,
      habitId: this.habitId,
      repeatId: this.repeatId,
    });

    todo.name = this.name;
    todo.description = this.description;
    todo.status = this.status ?? TodoStatus.TODO;
    todo.importance = this.importance;
    todo.urgency = this.urgency;
    todo.planDate = this.planDate;
    todo.planStartTime = this.planStartTime;
    todo.planEndTime = this.planEndTime;
    todo.relatedType = related.relatedType ?? TodoRelatedType.NONE;
    todo.relatedId = related.relatedId;

    return todo;
  }
}

export class UpdateTodoDto extends IntersectionType(
  PartialType(CreateTodoDto),
  PickType(Todo, ['id'] as const),
  PickType(TodoDto, ['doneAt', 'abandonedAt'] as const)
) {
  importUpdateVo(vo: TodoVO.UpdateTodoVo) {
    this.name = vo.name;
    this.description = vo.description;
    this.importance = vo.importance;
    this.urgency = vo.urgency;
    this.planDate = dayjs(vo.planDate).toDate();
    this.taskId = vo.taskId;
    this.habitId = vo.habitId;
    this.repeatId = vo.repeatId;
    this.relatedId = vo.relatedId;
    this.relatedType = vo.relatedType;
    this.planStartTime = vo.planStartTime;
    this.planEndTime = vo.planEndTime;
    this.status = vo.status;
  }

  importUpdateEntity(todo: Todo) {
    if (this.id === undefined) {
      this.id = todo.id;
    } else if (this.id !== todo.id) {
      throw new Error('ID不匹配');
    }
    if (this.name === undefined) this.name = todo.name;
    if (this.description === undefined) this.description = todo.description;
    if (this.status === undefined) this.status = todo.status;
    if (this.planDate === undefined) this.planDate = todo.planDate;
    if (this.planStartTime === undefined) this.planStartTime = todo.planStartTime;
    if (this.planEndTime === undefined) this.planEndTime = todo.planEndTime;
    if (this.importance === undefined) this.importance = todo.importance;
    if (this.urgency === undefined) this.urgency = todo.urgency;
    if (this.doneAt === undefined) this.doneAt = todo.doneAt;
    if (this.abandonedAt === undefined) this.abandonedAt = todo.abandonedAt;
    if (this.relatedType === undefined) this.relatedType = todo.relatedType;
    if (this.relatedId === undefined) this.relatedId = todo.relatedId;
  }

  exportUpdateEntity() {
    const todo = new Todo();
    todo.id = this.id;
    if (this.name !== undefined) todo.name = this.name;
    if (this.description !== undefined) todo.description = this.description;
    if (this.status !== undefined) todo.status = this.status;
    if (this.planDate !== undefined) todo.planDate = this.planDate;
    if (this.planStartTime !== undefined) todo.planStartTime = this.planStartTime;
    if (this.planEndTime !== undefined) todo.planEndTime = this.planEndTime;
    if (this.importance !== undefined) todo.importance = this.importance;
    if (this.urgency !== undefined) todo.urgency = this.urgency;
    if (this.doneAt !== undefined) todo.doneAt = this.doneAt;
    if (this.abandonedAt !== undefined) todo.abandonedAt = this.abandonedAt;
    if (this.relatedType !== undefined || this.relatedId !== undefined || this.taskId !== undefined) {
      const related = mapCompatIdsToRelated({
        relatedType: this.relatedType,
        relatedId: this.relatedId,
        taskId: this.taskId,
        habitId: this.habitId,
        repeatId: this.repeatId,
      });
      if (this.relatedType !== undefined || this.taskId !== undefined || this.habitId !== undefined || this.repeatId !== undefined) {
        todo.relatedType = related.relatedType;
      }
      if (this.relatedId !== undefined || this.taskId !== undefined || this.habitId !== undefined || this.repeatId !== undefined) {
        todo.relatedId = related.relatedId;
      }
    }
    return todo;
  }
}
