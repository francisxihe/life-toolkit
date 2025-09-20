import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goal, Todo, Habit } from '@life-toolkit/business-server';
import { HabitRepository } from './habit.repository';
import { HabitStatusService } from './habit-status.service';
import { HabitService } from './habit.service';
import { HabitController } from './habit.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Habit, Goal, Todo])],
  controllers: [HabitController],
  providers: [HabitRepository, HabitStatusService, HabitService],
  exports: [HabitRepository, HabitService],
})
export class HabitModule {}
