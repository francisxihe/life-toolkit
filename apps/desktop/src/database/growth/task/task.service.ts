import { TaskService as _TaskService } from "@life-toolkit/business-server";
import { TaskRepository } from "./task.repository";
import { TaskTreeRepository } from "./task-tree.repository";
import { DesktopTodoCleanupService } from "./todo-cleanup.service";

export class TaskService extends _TaskService {
  constructor() {
    const repo = new TaskRepository();
    const treeRepo = new TaskTreeRepository();
    const todoCleanup = new DesktopTodoCleanupService();
    super(repo, treeRepo, todoCleanup);
  }
}

export const taskService = new TaskService();
