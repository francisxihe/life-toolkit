import { TodoService as _TodoService } from "@life-toolkit/business-server";
import { TodoRepository } from "./todo.repository";

export class TodoService extends _TodoService {
  constructor() {
    const todoRepository = new TodoRepository();
    super(todoRepository);
  }
}

export const todoService = new TodoService();
