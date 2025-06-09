import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Habit } from "./entities";
import { Goal } from "../goal/entities";
import { Todo } from "../todo/entities";
import { HabitService } from "./habit.service";
import { HabitController } from "./habit.controller";
import { HabitRepository } from "./habit.repository";
import { HabitStatusService } from "./habit-status.service";

@Module({
  imports: [TypeOrmModule.forFeature([Habit, Goal, Todo])],
  controllers: [HabitController],
  providers: [
    HabitService,
    HabitRepository,
    HabitStatusService,
  ],
  exports: [HabitService, HabitRepository],
})
export class HabitModule {}
