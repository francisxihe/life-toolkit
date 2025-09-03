import { UpdateResult } from 'typeorm';
import { Todo } from './todo.entity';
import { TodoPageFiltersDto, TodoListFilterDto } from './dto';

export interface TodoRepository {
  create(todo: Todo): Promise<Todo>;
  findOneByRepeatAndDate(repeatId: string, date: Date): Promise<Todo | null>;
  createWithExtras(todo: Todo, extras: Todo): Promise<Todo>;
  findAll(filter: TodoListFilterDto): Promise<Todo[]>;
  page(filter: TodoPageFiltersDto): Promise<{
    list: Todo[];
    total: number;
    pageNum: number;
    pageSize: number;
  }>;
  update(todoUpdate: Todo): Promise<Todo>;
  updateByFilter(filter: TodoListFilterDto, todoUpdate: Todo): Promise<UpdateResult>;
  delete(id: string): Promise<boolean>;
  deleteByFilter(filter: TodoPageFiltersDto): Promise<void>;
  findById(id: string, relations?: string[]): Promise<Todo>;
  updateRepeatId(id: string, repeatId: string): Promise<void>;
  softDeleteByTaskIds(taskIds: string[]): Promise<void>;
}
