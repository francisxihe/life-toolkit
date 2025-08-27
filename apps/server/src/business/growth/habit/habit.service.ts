import { Injectable } from "@nestjs/common";
import { HabitService as HabitServiceBase } from "@life-toolkit/business-server";
import { HabitRepository } from "./habit.repository";
import { HabitStatusService } from "./habit-status.service";
import { OperationByIdListDto } from "@/common/operation";

@Injectable()
export class HabitService extends HabitServiceBase {
  constructor(
    readonly habitRepository: HabitRepository,
    private readonly habitStatusService: HabitStatusService
  ) {
    super(habitRepository);
  }

  // 状态操作（委托给状态服务）
  async done(id: string): Promise<void> {
    await this.habitStatusService.done(id);
  }

  async abandon(id: string): Promise<void> {
    await this.habitStatusService.abandon(id);
  }

  async restore(id: string): Promise<void> {
    await this.habitStatusService.restore(id);
  }

  async pause(id: string): Promise<void> {
    await this.habitStatusService.pause(id);
  }

  async resume(id: string): Promise<void> {
    await this.habitStatusService.resume(id);
  }

  // 批量操作
  async batchDone(params: OperationByIdListDto): Promise<void> {
    await this.habitStatusService.batchDone(params);
  }
}
