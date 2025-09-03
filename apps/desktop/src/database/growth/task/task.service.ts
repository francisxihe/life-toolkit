import { TaskService as _TaskService } from "@life-toolkit/business-server";
import { TaskRepository } from "./task.repository";
import { TaskTreeRepository } from "./task-tree.repository";
import { TodoRepository } from "../todo/todo.repository";
import { TodoRepeatRepository } from "../todo/todo-repeat.repository";

export class TaskService extends _TaskService {
  constructor() {
    const repo = new TaskRepository();
    const treeRepo = new TaskTreeRepository();
    const todoRepo = new TodoRepository();
    const todoRepeatRepo = new TodoRepeatRepository();
    super(repo, treeRepo, todoRepo, todoRepeatRepo);
  }
}

export const taskService = new TaskService();
