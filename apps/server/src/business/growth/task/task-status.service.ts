import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { TaskStatus, Task } from "./entities";
import {
  OperationByIdListDto,
  OperationByIdListResultDto,
} from "@/common/operation";
@Injectable()
export class TaskStatusService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>
  ) {}

  private async updateStatus(
    id: string,
    status: TaskStatus,
    dateField: keyof Task
  ): Promise<boolean> {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new Error("Task not found");
    }

    await this.taskRepository.update(id, {
      status,
      [dateField]: new Date(),
    });

    return true;
  }

  async batchDone(
    params: OperationByIdListDto
  ): Promise<OperationByIdListResultDto> {
    await this.taskRepository.update(
      { id: In(params.idList) },
      {
        status: TaskStatus.DONE,
        doneAt: new Date(),
      }
    );

    return {
      result: true,
    };
  }

  async abandon(id: string): Promise<boolean> {
    return this.updateStatus(id, TaskStatus.ABANDONED, "abandonedAt");
  }

  async restore(id: string): Promise<boolean> {
    return this.updateStatus(id, TaskStatus.TODO, "updatedAt");
  }
}
