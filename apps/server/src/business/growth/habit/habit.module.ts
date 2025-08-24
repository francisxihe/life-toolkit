import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Habit } from "./entities";
import { Goal } from "../goal/goal.entity";
import { Todo } from "../todo/entities";
import { HabitRepository } from "./habit.repository";
import { HabitStatusService } from "./habit-status.service";
import { HabitService } from "./habit.service";
import { HabitController } from "./habit.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Habit, Goal, Todo])],
  controllers: [HabitController],
  providers: [HabitRepository, HabitStatusService, HabitService],
  exports: [HabitRepository, HabitService],
})
export class HabitModule {}
