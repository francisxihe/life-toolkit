import { Injectable } from "@nestjs/common";
import { TodoService as TodoServiceBase } from "@life-toolkit/business-server";
import { TodoRepeatService } from "./todo-repeat.service";
import { TodoRepository } from "./todo.repository";
import { TodoStatusService } from "./todo-status.service";

@Injectable()
export class TodoService extends TodoServiceBase {
  constructor(
    readonly todoRepeatService: TodoRepeatService,
    readonly todoRepository: TodoRepository,
    readonly todoStatusService: TodoStatusService
  ) {
    super(
      todoRepeatService as unknown as any,
      todoRepository as unknown as any,
      todoStatusService as unknown as any
    );
  }
}
