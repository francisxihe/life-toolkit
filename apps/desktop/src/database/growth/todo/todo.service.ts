import { TodoService as _TodoService } from "@life-toolkit/business-server";
import { TodoRepository } from "./todo.repository";
import { TodoRepeatRepository } from "./todo-repeat.repository";

export class TodoService extends _TodoService {
  constructor() {
    const todoRepository = new TodoRepository();
    const todoRepeatRepository = new TodoRepeatRepository();
    super(todoRepository, todoRepeatRepository);
  }
}

export const todoService = new TodoService();
