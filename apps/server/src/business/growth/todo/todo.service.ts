import { Injectable } from "@nestjs/common";
import { TodoService as TodoServiceBase } from "@life-toolkit/business-server";
import { TodoRepeatService } from "./todo-repeat.service";
import { TodoRepository } from "./todo.repository";

@Injectable()
export class TodoService extends TodoServiceBase {
  constructor(
    todoRepeatService: TodoRepeatService,
    todoRepository: TodoRepository
  ) {
    super(todoRepeatService, todoRepository);
  }
}
