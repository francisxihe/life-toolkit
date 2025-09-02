import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Todo } from "@life-toolkit/business-server";
import { TodoStatus } from "@life-toolkit/enum";
import {
  OperationByIdListDto,
  OperationByIdListResultDto,
} from "@/common/operation";

@Injectable()
export class TodoStatusService {
  constructor(private readonly dataSource: DataSource) {}

  private async updateStatus(
    id: string,
    status: TodoStatus,
    dateField: keyof Todo
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const todo = await manager.findOneBy(Todo, { id });
      if (!todo) {
        throw new Error("Todo not found");
      }

      // 如果是重复待办：不再解绑重复配置，仅更新状态与时间，并创建下一条
    });
  }

  async batchDone(
    params: OperationByIdListDto
  ): Promise<OperationByIdListResultDto> {
    // 批量完成需要逐个处理，因为可能涉及重复待办的处理
    for (const id of params.includeIds) {
      await this.updateStatus(id, TodoStatus.DONE, "doneAt");
    }

    return {
      result: true,
    };
  }

  async abandon(id: string): Promise<void> {
    await this.updateStatus(id, TodoStatus.ABANDONED, "abandonedAt");
  }

  async done(id: string): Promise<void> {
    await this.updateStatus(id, TodoStatus.DONE, "doneAt");
  }

  async restore(id: string): Promise<void> {
    await this.updateStatus(id, TodoStatus.TODO, "updatedAt");
  }
}
