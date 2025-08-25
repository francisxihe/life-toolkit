import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GoalService } from "./goal.service";
import { GoalController } from "./goal.controller";
import { GoalRepository } from "./goal.repository";
import { GoalTreeRepository } from "./goal-tree.repository";
import { Task } from "../task";
import { TrackTime } from "../track-time/entity";
import { Habit, Goal } from "@life-toolkit/business-server";

@Module({
  imports: [TypeOrmModule.forFeature([Goal, Task, TrackTime, Habit])],
  controllers: [GoalController],
  providers: [GoalRepository, GoalTreeRepository, GoalService],
  exports: [GoalRepository, GoalTreeRepository, GoalService],
})
export class GoalModule {}
