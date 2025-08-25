import {
  TodoService as _TodoService,
  CreateTodoDto,
  UpdateTodoDto,
  TodoListFilterDto,
  TodoPageFiltersDto,
  TodoDto,
  TodoMapper,
} from "@life-toolkit/business-server";
import { TodoRepository } from "./todo.repository";
import TodoRepeatService from "./todo.repeat.service";
import { TodoStatus } from "@life-toolkit/enum";

export class TodoService extends _TodoService {
  constructor() {
    const repeatService = new TodoRepeatService();
    const todoRepository = new TodoRepository();
    super(repeatService, todoRepository);
  }
}

export const todoService = new TodoService();
