import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Goal } from "./entities";
import { GoalService } from "./goal.service";
import { GoalController } from "./goal.controller";
import { GoalStatusService } from "./goal-status.service";
import { TaskService } from "../task/task.service";
import { Task } from "../task/entities";
import { TrackTime } from "../track-time/entity";
import { TodoModule } from "../todo/todo.module";

@Module({
  imports: [TypeOrmModule.forFeature([Goal, Task, TrackTime]), TodoModule],
  controllers: [GoalController],
  providers: [GoalService, GoalStatusService, TaskService],
  exports: [GoalService],
})
export class GoalModule {}
