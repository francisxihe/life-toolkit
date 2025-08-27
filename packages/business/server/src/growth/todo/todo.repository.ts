import { Todo } from "./todo.entity";
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoPageFiltersDto,
  TodoListFilterDto,
  TodoDto,
} from "./dto";

export interface TodoRepository {
  create(createTodoDto: CreateTodoDto): Promise<TodoDto>;
  findOneByRepeatAndDate(repeatId: string, date: Date): Promise<TodoDto | null>;
  createWithExtras(
    createTodoDto: CreateTodoDto,
    extras: Partial<Todo>
  ): Promise<TodoDto>;
  findAll(filter: TodoListFilterDto): Promise<TodoDto[]>;
  page(filter: TodoPageFiltersDto): Promise<{
    list: TodoDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }>;
  update(id: string, updateTodoDto: UpdateTodoDto): Promise<TodoDto>;
  batchUpdate(
    idList: string[],
    updateTodoDto: UpdateTodoDto
  ): Promise<TodoDto[]>;
  delete(id: string): Promise<boolean>;
  deleteByFilter(filter: TodoPageFiltersDto): Promise<void>;
  findById(id: string, relations?: string[]): Promise<TodoDto>;
  updateRepeatId(id: string, repeatId: string): Promise<void>;
  softDeleteByTaskIds(taskIds: string[]): Promise<void>;
}