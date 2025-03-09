import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Task } from "./entities";
import { TrackTime } from "../track-time";
import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";
import { TaskStatusService } from "./task-status.service";

@Module({
  imports: [TypeOrmModule.forFeature([Task, TrackTime])],
  controllers: [TaskController],
  providers: [TaskService, TaskStatusService],
  exports: [TaskService, TaskStatusService],
})
export class TaskModule {}
