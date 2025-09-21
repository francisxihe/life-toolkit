import { Injectable } from '@nestjs/common';
import { TaskService as TaskServiceBase } from '@life-toolkit/business-server';
import { TodoService } from '../todo/todo.service';
import { TaskRepository } from './task.repository';
import { TaskTreeRepository } from './task-tree.repository';

@Injectable()
export class TaskService extends TaskServiceBase {
  constructor(taskRepository: TaskRepository, taskTreeRepository: TaskTreeRepository, todoService: TodoService) {
    super(taskRepository, taskTreeRepository, todoService);
  }
}
