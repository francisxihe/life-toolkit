import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Habit, HabitLog } from './entities';
import { Goal } from '../goal/entities';
import { TodoRepeat, Todo } from '../todo/entities';
import { HabitService } from './habit.service';
import { HabitLogService } from './habit-log.service';
import { HabitController } from './habit.controller';
import { HabitLogController } from './habit-log.controller';
import { HabitMapper, HabitLogMapper } from './mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Habit, HabitLog, Goal, TodoRepeat, Todo])],
  controllers: [HabitController, HabitLogController],
  providers: [HabitService, HabitLogService, HabitMapper, HabitLogMapper],
  exports: [HabitService, HabitLogService],
})
export class HabitModule {} 