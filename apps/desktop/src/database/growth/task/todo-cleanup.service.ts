import { TodoCleanupService } from "@life-toolkit/business-server";
import { TodoRepository } from "../todo/todo.repository";
import { TodoListFilterDto } from "@life-toolkit/business-server";

// 轻量适配器：委托桌面端 TodoRepository 的软删除逻辑
export class DesktopTodoCleanupService implements TodoCleanupService {
  private readonly todoRepo: TodoRepository;

  constructor() {
    this.todoRepo = new TodoRepository();
  }

  async deleteByTaskIds(taskIds: string[]): Promise<void> {
    if (!Array.isArray(taskIds) || taskIds.length === 0) return;
    const filter = new TodoListFilterDto();
    filter.taskIds = taskIds;
    await this.todoRepo.softDeleteByFilter(filter);
  }
}
