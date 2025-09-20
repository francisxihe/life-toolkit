import { Injectable } from '@nestjs/common';
import { TodoService as _TodoService } from '@life-toolkit/business-server';
import { TodoRepository } from './todo.repository';
import { TodoRepeatRepository } from '@life-toolkit/business-server';

@Injectable()
export class TodoService extends _TodoService {
  constructor(todoRepository: TodoRepository, todoRepeatRepository: TodoRepeatRepository) {
    super(todoRepository, todoRepeatRepository);
  }
}
