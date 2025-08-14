import { Injectable } from "@nestjs/common";
import { TaskService as TaskServiceBase } from "@life-toolkit/business-server";
import { TodoService } from "../todo/todo.service";
import { TaskRepository } from "./task.repository";
import { TaskTreeRepository } from "./task-tree.repository";

@Injectable()
export class TaskService extends TaskServiceBase {
  constructor(
    readonly taskRepository: TaskRepository,
    readonly taskTreeRepository: TaskTreeRepository,
    readonly todoService: TodoService
  ) {
    super(taskRepository as unknown as any, taskTreeRepository as unknown as any, todoService as unknown as any);
  }
}
