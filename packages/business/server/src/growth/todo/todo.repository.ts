import { Todo } from "./todo.entity";
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoPageFilterDto,
  TodoListFilterDto,
  TodoDto,
} from "./dto";

export interface TodoRepository {
  create(createTodoDto: CreateTodoDto): Promise<TodoDto>;
  findOneByRepeatAndDate(repeatId: string, date: Date): Promise<TodoDto | null>;
  createWithExtras(createTodoDto: CreateTodoDto, extras: Partial<Todo>): Promise<TodoDto>;
  findAll(filter: TodoListFilterDto): Promise<TodoDto[]>;
  findPage(filter: TodoPageFilterDto): Promise<{
    list: TodoDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }>;
  update(id: string, updateTodoDto: UpdateTodoDto): Promise<TodoDto>;
  delete(id: string): Promise<boolean>;
  deleteByFilter(filter: TodoPageFilterDto): Promise<void>;
  findById(id: string, relations?: string[]): Promise<TodoDto>;
  updateRepeatId(id: string, repeatId: string): Promise<void>;
  softDeleteByTaskIds(taskIds: string[]): Promise<void>;
}

export interface TodoRepeatService {
  create(dto: any): Promise<any>;
  update(id: string, dto: any): Promise<any>;
}

export interface TodoStatusService {
  batchDone(params: { idList: string[] }): Promise<any>;
  done(id: string): Promise<any>;
  abandon(id: string): Promise<any>;
  restore(id: string): Promise<any>;
}
