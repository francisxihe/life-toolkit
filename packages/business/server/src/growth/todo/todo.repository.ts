import { UpdateResult } from 'typeorm';
import { Todo } from './todo.entity';
import { TodoPageFiltersDto, TodoListFilterDto } from './dto';

export interface TodoRepository {
  create(todo: Todo): Promise<Todo>;
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
  softDelete(id: string): Promise<void>;
  softDeleteByFilter(filter: TodoListFilterDto): Promise<void>;
  find(id: string): Promise<Todo>;
  findWithRelations(id: string, relations?: string[]): Promise<Todo>;
}
