import {
  PickType,
  IntersectionType,
  PartialType,
} from "@life-toolkit/mapped-types";
import { TodoDto } from "./todo-model.dto";
import { Todo } from "../todo.entity";
import { TodoSource, TodoStatus } from "@life-toolkit/enum";

export class CreateTodoDto extends PickType(TodoDto, [
  "name",
  "description",
  "status",
  "planDate",
  "planStartAt",
  "planEndAt",
  "importance",
  "urgency",
  "tags",
] as const) {
  taskId?: string;

  toCreateEntity() {
    const entity = new Todo();

    entity.name = this.name;
    entity.description = this.description;
    entity.status = this.status ?? TodoStatus.TODO;
    entity.importance = this.importance;
    entity.urgency = this.urgency;
    entity.tags = this.tags;
    entity.planDate = this.planDate;
    entity.planStartAt = this.planStartAt;
    entity.planEndAt = this.planEndAt;
    entity.taskId = this.taskId;
    entity.source = TodoSource.MANUAL;

    return entity;
  }
}

export class UpdateTodoDto extends IntersectionType(
  PartialType(CreateTodoDto),
  PickType(Todo, ["id"] as const),
  PickType(TodoDto, ["doneAt", "abandonedAt"] as const)
) {
  importUpdateEntity(entity: Todo) {
    if (this.id === undefined) {
      this.id = entity.id;
    } else if (this.id !== entity.id) {
      throw new Error("ID不匹配");
    }
    if (this.name === undefined) this.name = entity.name;
    if (this.description === undefined) this.description = entity.description;
    if (this.status === undefined) this.status = entity.status;
    if (this.planDate === undefined) this.planDate = entity.planDate;
    if (this.planStartAt === undefined) this.planStartAt = entity.planStartAt;
    if (this.planEndAt === undefined) this.planEndAt = entity.planEndAt;
    if (this.importance === undefined) this.importance = entity.importance;
    if (this.urgency === undefined) this.urgency = entity.urgency;
    if (this.tags === undefined) this.tags = entity.tags;
    if (this.doneAt === undefined) this.doneAt = entity.doneAt;
    if (this.abandonedAt === undefined) this.abandonedAt = entity.abandonedAt;
    if (this.taskId === undefined) this.taskId = entity.taskId;
  }

  toUpdateEntity() {
    const todo = new Todo();
    todo.id = this.id;
    if (this.name !== undefined) todo.name = this.name;
    if (this.description !== undefined) todo.description = this.description;
    if (this.status !== undefined) todo.status = this.status;
    if (this.planDate !== undefined) todo.planDate = this.planDate;
    if (this.planStartAt !== undefined) todo.planStartAt = this.planStartAt;
    if (this.planEndAt !== undefined) todo.planEndAt = this.planEndAt;
    if (this.importance !== undefined) todo.importance = this.importance;
    if (this.urgency !== undefined) todo.urgency = this.urgency;
    if (this.tags !== undefined) todo.tags = this.tags;
    if (this.doneAt !== undefined) todo.doneAt = this.doneAt;
    if (this.abandonedAt !== undefined) todo.abandonedAt = this.abandonedAt;
    if (this.taskId !== undefined) todo.taskId = this.taskId;
    return todo;
  }
}
