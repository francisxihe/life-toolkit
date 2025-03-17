import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Goal } from "./entities";
import { GoalService } from "./goal.service";
import { GoalController } from "./goal.controller";
import { GoalStatusService } from "./goal-status.service";
import { Task } from "../task/entities";
import { TrackTime } from "../track-time/entity";
import { TodoModule } from "../todo/todo.module";
import { TaskModule } from "../task/task.module";
import { GoalTreeService } from "./goal-tree.service";
@Module({
  imports: [
    TypeOrmModule.forFeature([Goal, Task, TrackTime]),
    TodoModule,
    TaskModule,
  ],
  controllers: [GoalController],
  providers: [GoalService, GoalStatusService, GoalTreeService],
  exports: [GoalService, GoalStatusService, GoalTreeService],
})
export class GoalModule {}
