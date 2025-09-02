import { Injectable } from "@nestjs/common";
import { Task } from "@life-toolkit/business-server";
import { TaskStatus } from "@life-toolkit/enum";
import {
  OperationByIdListDto,
  OperationByIdListResultDto,
} from "@/common/operation";
import { TaskRepository } from "./task.repository";
@Injectable()
export class TaskStatusService {
  constructor(
    private readonly taskRepository: TaskRepository
  ) {}

  private async updateStatus(
    id: string,
    status: TaskStatus,
    dateField: keyof Task
  ): Promise<void> {
    await this.taskRepository.updateStatus(id, status, dateField);
  }

  async batchDone(
    params: OperationByIdListDto
  ): Promise<OperationByIdListResultDto> {
    await this.taskRepository.batchDone(params.includeIds);

    return {
      result: true,
    };
  }

  async abandon(id: string): Promise<void> {
    await this.updateStatus(id, TaskStatus.ABANDONED, "abandonedAt");
  }

  async restore(id: string): Promise<void> {
    await this.updateStatus(id, TaskStatus.TODO, "updatedAt");
  }
}
