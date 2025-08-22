import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { TodoStatus, Todo } from "./entities";
import {
  OperationByIdListDto,
  OperationByIdListResultDto,
} from "@/common/operation";
import { TodoRepeatService } from "./todo-repeat.service";

@Injectable()
export class TodoStatusService {
  constructor(
    private readonly todoRepeatService: TodoRepeatService,
    private readonly dataSource: DataSource
  ) {}

  private async updateStatus(
    id: string,
    status: TodoStatus,
    dateField: keyof Todo
  ): Promise<boolean> {
    return await this.dataSource.transaction(async (manager) => {
      const todo = await manager.findOneBy(Todo, { id });
      if (!todo) {
        throw new Error("Todo not found");
      }

      // 如果是重复待办，需要在事务中处理
      if (todo.repeatId) {
        const repeatId = todo.repeatId;
        
        // 先将当前待办转为普通待办，清除重复配置关联
        await manager.update(Todo, id, {
          status,
          [dateField]: new Date(),
          originalRepeatId: repeatId, // 保存原始重复配置ID
          repeatId: undefined, // 移除重复配置关联
        });
        
        // 然后创建下一个重复待办
        await this.todoRepeatService.createNextTodo(todo);
      } else {
        await manager.update(Todo, id, {
          status,
          [dateField]: new Date(),
        });
      }

      return true;
    });
  }

  async batchDone(
    params: OperationByIdListDto
  ): Promise<OperationByIdListResultDto> {
    // 批量完成需要逐个处理，因为可能涉及重复待办的处理
    for (const id of params.idList) {
      await this.updateStatus(id, TodoStatus.DONE, "doneAt");
    }

    return {
      result: true,
    };
  }

  async abandon(id: string): Promise<boolean> {
    return this.updateStatus(id, TodoStatus.ABANDONED, "abandonedAt");
  }

  async done(id: string): Promise<boolean> {
    return this.updateStatus(id, TodoStatus.DONE, "doneAt");
  }

  async restore(id: string): Promise<boolean> {
    return this.updateStatus(id, TodoStatus.TODO, "updatedAt");
  }
}
