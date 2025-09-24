import { PickType, IntersectionType, PartialType } from 'francis-mapped-types';
import { TodoSource, TodoStatus } from '@life-toolkit/enum';
import { Todo as TodoVO } from '@life-toolkit/vo';
import dayjs from 'dayjs';
import { TodoDto } from './todo-model.dto';
import { Todo } from '../todo.entity';

export class CreateTodoDto extends PickType(TodoDto, [
  'name',
  'description',
  'status',
  'planDate',
  'planStartTime',
  'planEndTime',
  'importance',
  'urgency',
  'tags',
  'source',
  'repeatConfig',
  'taskId',
  'repeatId',
  'habitId',
] as const) {
  importCreateVo(vo: TodoVO.CreateTodoVo) {
    this.name = vo.name;
    this.description = vo.description;
    this.tags = vo.tags || [];
    this.importance = vo.importance;
    this.urgency = vo.urgency;
    this.planDate = dayjs(vo.planDate).toDate();
    this.planStartTime = vo.planStartTime ? dayjs(vo.planStartTime).format('HH:mm:ss') : undefined;
    this.planEndTime = vo.planEndTime ? dayjs(vo.planEndTime).format('HH:mm:ss') : undefined;
    this.taskId = vo.taskId;
  }

  exportCreateEntity(): Todo {
    const todo = new Todo();

    todo.name = this.name;
    todo.description = this.description;
    todo.status = this.status ?? TodoStatus.TODO;
    todo.importance = this.importance;
    todo.urgency = this.urgency;
    todo.tags = this.tags;
    todo.planDate = this.planDate;
    todo.planStartTime = this.planStartTime;
    todo.planEndTime = this.planEndTime;
    todo.taskId = this.taskId;
    todo.repeatId = this.repeatId;
    todo.habitId = this.habitId;
    todo.source = this.source ?? TodoSource.MANUAL;

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
    this.tags = vo.tags;
    this.importance = vo.importance;
    this.urgency = vo.urgency;
    this.planDate = dayjs(vo.planDate).toDate();
    this.taskId = vo.taskId;
    this.planStartTime = vo.planStartTime;
    this.planEndTime = vo.planEndTime;
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
    if (this.tags === undefined) this.tags = todo.tags;
    if (this.doneAt === undefined) this.doneAt = todo.doneAt;
    if (this.abandonedAt === undefined) this.abandonedAt = todo.abandonedAt;
    if (this.taskId === undefined) this.taskId = todo.taskId;
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
    if (this.tags !== undefined) todo.tags = this.tags;
    if (this.doneAt !== undefined) todo.doneAt = this.doneAt;
    if (this.abandonedAt !== undefined) todo.abandonedAt = this.abandonedAt;
    if (this.taskId !== undefined) todo.taskId = this.taskId;
    return todo;
  }
}
