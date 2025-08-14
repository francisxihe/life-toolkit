import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Task } from "./entities";
import { TrackTime } from "../track-time";
import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";
import { TaskStatusService } from "./task-status.service";
import { TodoModule } from "../todo/todo.module";
import { TaskTreeService } from "./task-tree.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TrackTime]),
    TodoModule,
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskStatusService, TaskTreeService],
  exports: [TaskService, TaskStatusService, TaskTreeService],
})
export class TaskModule {}
