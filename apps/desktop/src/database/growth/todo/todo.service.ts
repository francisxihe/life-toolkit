import { TodoService as _TodoService } from "@life-toolkit/business-server";
import { TodoRepository } from "./todo.repository";
import TodoRepeatService from "./todo.repeat.service";

export class TodoService extends _TodoService {
  constructor() {
    const repeatService = new TodoRepeatService();
    const todoRepository = new TodoRepository();
    super(repeatService, todoRepository);
  }
}

export const todoService = new TodoService();
