import { TodoCleanupService } from "@life-toolkit/business-server";
import { TodoRepository as DesktopTodoRepository } from "../todo/todo.repository";

// 轻量适配器：委托桌面端 TodoRepository 的软删除逻辑
export class DesktopTodoCleanupService implements TodoCleanupService {
  private readonly todoRepo: DesktopTodoRepository;

  constructor() {
    this.todoRepo = new DesktopTodoRepository();
  }

  async deleteByTaskIds(taskIds: string[]): Promise<void> {
    if (!Array.isArray(taskIds) || taskIds.length === 0) return;
    await this.todoRepo.softDeleteByTaskIds(taskIds);
  }
}
