import { Repository, In } from "typeorm";
import { AppDataSource } from "../../database.config";
import { Todo, TodoStatus } from "./todo.entity";
import { TodoStatusService } from "@life-toolkit/business-server";

export class DesktopTodoStatusService implements TodoStatusService {
  private repo: Repository<Todo>;
  constructor() {
    this.repo = AppDataSource.getRepository(Todo);
  }

  async batchDone(params: { idList: string[] }): Promise<any> {
    if (!params?.idList?.length) return;
    await this.repo.update(
      { id: In(params.idList) },
      { status: TodoStatus.DONE, doneAt: new Date() }
    );
  }

  async done(id: string): Promise<any> {
    await this.repo.update(id, { status: TodoStatus.DONE, doneAt: new Date() });
  }

  async abandon(id: string): Promise<any> {
    await this.repo.update(id, { status: TodoStatus.ABANDONED, abandonedAt: new Date() });
  }

  async restore(id: string): Promise<any> {
    await this.repo.update(id, { status: TodoStatus.TODO, doneAt: null as any, abandonedAt: null as any });
  }
}
