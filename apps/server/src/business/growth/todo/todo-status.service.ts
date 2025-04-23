import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { TodoStatus, Todo, TodoRepeat } from "./entities";
import {
  OperationByIdListDto,
  OperationByIdListResultDto,
} from "@/common/operation";
@Injectable()
export class TodoStatusService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>
  ) {}

  private async updateStatus(
    id: string,
    status: TodoStatus,
    dateField: keyof Todo
  ): Promise<boolean> {
    const todo = await this.todoRepository.findOneBy({ id });
    if (!todo) {
      throw new Error("Todo not found");
    }

    await this.todoRepository.update(id, {
      status,
      [dateField]: new Date(),
    });

    return true;
  }

  async batchDone(
    params: OperationByIdListDto
  ): Promise<OperationByIdListResultDto> {
    await this.todoRepository.update(
      { id: In(params.idList) },
      {
        status: TodoStatus.DONE,
        doneAt: new Date(),
      }
    );

    return {
      result: true,
    };
  }

  async abandon(id: string): Promise<boolean> {
    return this.updateStatus(id, TodoStatus.ABANDONED, "abandonedAt");
  }

  async restore(id: string): Promise<boolean> {
    return this.updateStatus(id, TodoStatus.TODO, "updatedAt");
  }
}
