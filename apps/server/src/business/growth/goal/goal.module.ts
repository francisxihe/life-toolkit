import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Goal } from "./entities";
import { GoalService } from "./goal.service";
import { GoalController } from "./goal.controller";
import { GoalRepository } from "./goal.repository";
import { GoalTreeService } from "./goal-tree.service";
import { Task } from "../task/entities";
import { TrackTime } from "../track-time/entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Goal, Task, TrackTime]),
  ],
  controllers: [GoalController],
  providers: [GoalRepository, GoalService, GoalTreeService],
  exports: [GoalRepository, GoalService, GoalTreeService],
})
export class GoalModule {}
