import { Injectable, BadRequestException } from '@nestjs/common';
import { HabitRepository } from './habit.repository';
import { HabitStatus } from '@life-toolkit/enum';
import { HabitDto } from '@life-toolkit/business-server';
import { OperationByIdListDto } from '@/common/operation';

@Injectable()
export class HabitStatusService {
  constructor(private readonly habitRepository: HabitRepository) {}

  async doneBatch(params: OperationByIdListDto): Promise<void> {
    await this.habitRepository.batchUpdate(params.includeIds, {
      status: HabitStatus.COMPLETED,
      completedCount: () => 'completed_count + 1',
    } as any);
  }

  async done(id: string): Promise<void> {
    const habit = await this.habitRepository.findById(id);

    // 业务规则验证
    if (!this.canMarkAsDone(habit)) {
      throw new BadRequestException('当前状态不允许标记为完成');
    }

    await this.habitRepository.updateStatus(id, HabitStatus.COMPLETED, {
      completedCount: habit.completedCount + 1,
    });
  }

  async abandon(id: string): Promise<void> {
    const habit = await this.habitRepository.findById(id);

    // 业务规则验证
    if (!this.canAbandon(habit)) {
      throw new BadRequestException('当前状态不允许放弃');
    }

    await this.habitRepository.updateStatus(id, HabitStatus.ABANDONED);
  }

  async restore(id: string): Promise<void> {
    const habit = await this.habitRepository.findById(id);

    // 业务规则验证
    if (!this.canRestore(habit)) {
      throw new BadRequestException('当前状态不允许恢复');
    }

    await this.habitRepository.updateStatus(id, HabitStatus.ACTIVE);
  }

  async pause(id: string): Promise<void> {
    const habit = await this.habitRepository.findById(id);

    // 业务规则验证
    if (!this.canPause(habit)) {
      throw new BadRequestException('当前状态不允许暂停');
    }

    await this.habitRepository.updateStatus(id, HabitStatus.PAUSED);
  }

  async resume(id: string): Promise<void> {
    const habit = await this.habitRepository.findById(id);

    // 业务规则验证
    if (!this.canResume(habit)) {
      throw new BadRequestException('当前状态不允许恢复');
    }

    await this.habitRepository.updateStatus(id, HabitStatus.ACTIVE);
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
