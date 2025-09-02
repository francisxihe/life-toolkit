import { UpdateResult } from "typeorm";
import { Todo } from "./todo.entity";
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoPageFiltersDto,
  TodoListFilterDto,
  TodoDto,
} from "./dto";

export interface TodoRepository {
  create(todo: Partial<Todo>): Promise<Todo>;
  findOneByRepeatAndDate(repeatId: string, date: Date): Promise<Todo | null>;
  createWithExtras(
    todo: Partial<Todo>,
    extras: Partial<Todo>
  ): Promise<Todo>;
  findAll(filter: TodoListFilterDto): Promise<Todo[]>;
  page(filter: TodoPageFiltersDto): Promise<{
    list: Todo[];
    total: number;
    pageNum: number;
    pageSize: number;
  }>;
  update(id: string, todoUpdate: Partial<Todo>): Promise<Todo>;
  batchUpdate(
    includeIds: string[],
    todoUpdate: Partial<Todo>
  ): Promise<UpdateResult>;
  delete(id: string): Promise<boolean>;
  deleteByFilter(filter: TodoPageFiltersDto): Promise<void>;
  findById(id: string, relations?: string[]): Promise<Todo>;
  updateRepeatId(id: string, repeatId: string): Promise<void>;
  softDeleteByTaskIds(taskIds: string[]): Promise<void>;
}