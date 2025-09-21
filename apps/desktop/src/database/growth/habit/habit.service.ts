import { HabitRepository } from './habit.repository';
import { TodoRepository } from '../todo/todo.repository';
import { HabitService as _HabitService } from '@life-toolkit/business-server';

export class HabitService extends _HabitService {
  constructor() {
    const habitRepo = new HabitRepository();
    const todoRepo = new TodoRepository();
    super(habitRepo, todoRepo);
  }
}

export const habitService = new HabitService();
