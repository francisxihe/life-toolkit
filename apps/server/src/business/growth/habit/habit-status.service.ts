import { Injectable, BadRequestException } from "@nestjs/common";
import { HabitRepository } from "./habit.repository";
import { HabitStatus } from "./entities";
import { HabitDto } from "./dto";
import { OperationByIdListDto } from "@/common/operation";

@Injectable()
export class HabitStatusService {
  constructor(
    private readonly habitRepository: HabitRepository,
  ) {}

  async batchDone(params: OperationByIdListDto): Promise<void> {
    // 批量验证
    await this.validateBatchOperation(params.idList, 'done');
    
    await this.habitRepository.batchUpdate(params.idList, {
      status: HabitStatus.COMPLETED,
      completedCount: () => "completed_count + 1",
    } as any);
  }

  async done(id: string): Promise<boolean> {
    const habit = await this.habitRepository.findById(id);
    
    // 业务规则验证
    if (!this.canMarkAsDone(habit)) {
      throw new BadRequestException("当前状态不允许标记为完成");
    }
    
    await this.habitRepository.updateStatus(id, HabitStatus.COMPLETED, {
      completedCount: habit.completedCount + 1,
    });
    
    return true;
  }

  async abandon(id: string): Promise<boolean> {
    const habit = await this.habitRepository.findById(id);
    
    // 业务规则验证
    if (!this.canAbandon(habit)) {
      throw new BadRequestException("当前状态不允许放弃");
    }
    
    await this.habitRepository.updateStatus(id, HabitStatus.ABANDONED);
    
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const habit = await this.habitRepository.findById(id);
    
    // 业务规则验证
    if (!this.canRestore(habit)) {
      throw new BadRequestException("当前状态不允许恢复");
    }
    
    await this.habitRepository.updateStatus(id, HabitStatus.ACTIVE);
    
    return true;
  }

  async pause(id: string): Promise<boolean> {
    const habit = await this.habitRepository.findById(id);
    
    // 业务规则验证
    if (!this.canPause(habit)) {
      throw new BadRequestException("当前状态不允许暂停");
    }
    
    await this.habitRepository.updateStatus(id, HabitStatus.PAUSED);
    
    return true;
  }

  async resume(id: string): Promise<boolean> {
    const habit = await this.habitRepository.findById(id);
    
    // 业务规则验证
    if (!this.canResume(habit)) {
      throw new BadRequestException("当前状态不允许恢复");
    }
    
    await this.habitRepository.updateStatus(id, HabitStatus.ACTIVE);
    
    return true;
  }

  // 私有业务方法
  private async validateBatchOperation(ids: string[], operation: string): Promise<void> {
    // 批量验证业务规则
    for (const id of ids) {
      const habit = await this.habitRepository.findById(id);
      
      switch (operation) {
        case 'done':
          if (!this.canMarkAsDone(habit)) {
            throw new BadRequestException(`习惯 ${habit.name} 当前状态不允许标记为完成`);
          }
          break;
        default:
          break;
      }
    }
  }

  private canMarkAsDone(habit: HabitDto): boolean {
    return habit.status === HabitStatus.ACTIVE || habit.status === HabitStatus.PAUSED;
  }

  private canAbandon(habit: HabitDto): boolean {
    return habit.status !== HabitStatus.ABANDONED;
  }

  private canRestore(habit: HabitDto): boolean {
    return habit.status === HabitStatus.ABANDONED || habit.status === HabitStatus.COMPLETED;
  }

  private canPause(habit: HabitDto): boolean {
    return habit.status === HabitStatus.ACTIVE;
  }

  private canResume(habit: HabitDto): boolean {
    return habit.status === HabitStatus.PAUSED;
  }
} 