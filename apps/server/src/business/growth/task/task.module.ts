import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '@life-toolkit/business-server';
import { TrackTime } from '../track-time';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskStatusService } from './task-status.service';
import { TodoModule } from '../todo/todo.module';
import { TaskRepository } from './task.repository';
import { TaskTreeRepository } from './task-tree.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TrackTime]), TodoModule],
  controllers: [TaskController],
  providers: [TaskRepository, TaskTreeRepository, TaskService, TaskStatusService],
  exports: [TaskRepository, TaskTreeRepository, TaskService, TaskStatusService],
})
export class TaskModule {}
