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
  create(createTodoDto: CreateTodoDto): Promise<Todo>;
  findOneByRepeatAndDate(repeatId: string, date: Date): Promise<Todo | null>;
  createWithExtras(
    createTodoDto: CreateTodoDto,
    extras: Partial<Todo>
  ): Promise<Todo>;
  findAll(filter: TodoListFilterDto): Promise<Todo[]>;
  page(filter: TodoPageFiltersDto): Promise<{
    list: Todo[];
    total: number;
    pageNum: number;
    pageSize: number;
  }>;
  update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo>;
  batchUpdate(
    includeIds: string[],
    updateTodoDto: UpdateTodoDto
  ): Promise<UpdateResult>;
  delete(id: string): Promise<boolean>;
  deleteByFilter(filter: TodoPageFiltersDto): Promise<void>;
  findById(id: string, relations?: string[]): Promise<Todo>;
  updateRepeatId(id: string, repeatId: string): Promise<void>;
  softDeleteByTaskIds(taskIds: string[]): Promise<void>;
}